import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import MapUser from "../../../components/MapUser";
import attendanceService from "../../../services/attendanceService";

type GeoState = "checking" | "granted" | "prompt" | "denied" | "unsupported";
type Coords = { lat: number; lng: number; accuracy?: number };

const Checkin = () => {
  const [geoState, setGeoState] = useState<GeoState>("checking");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState<string>("");
  const { id } = useParams();

  const navigate = useNavigate();

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dtFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "medium",
        timeZone: "Asia/Singapore",
      }),
    []
  );

  const watchIdRef = useRef<number | null>(null);
  const round = (n: number, d = 6) => Number(n.toFixed(d));

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();
      setAddress(data?.display_name || `Lat: ${round(lat, 5)}, Lng: ${round(lng, 5)}`);
    } catch {
      setAddress(`Lat: ${round(lat, 5)}, Lng: ${round(lng, 5)}`);
    }
  };

  const startWatching = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      setGeoError("Geolocation not supported by this browser.");
      return;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoState("granted");
        setGeoError(null);
        const { latitude, longitude, accuracy } = pos.coords;
        const lat = round(latitude);
        const lng = round(longitude);
        setCoords({ lat, lng, accuracy });
        reverseGeocode(lat, lng);
      },
      (err) => {
        if (err.code === 1) setGeoState("denied");
        else setGeoState("prompt");
        setGeoError(err.message || "Unable to get location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    watchIdRef.current = id;
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      setGeoError("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => startWatching(),
      (err) => {
        if (err.code === 1) setGeoState("denied");
        else setGeoState("prompt");
        setGeoError(err.message || "Unable to get location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      return;
    }
    const anyNav: any = navigator as any;
    if (anyNav.permissions?.query) {
      anyNav.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status: PermissionStatus) => {
          setGeoState(status.state as GeoState);
          status.onchange = () => {
            const nextState = status.state as GeoState;
            setGeoState(nextState);
            if (nextState === "granted") startWatching();
          };
          if (status.state === "granted") startWatching();
          else if (status.state === "prompt") requestLocation();
        })
        .catch(() => {
          setGeoState("prompt");
          requestLocation();
        });
    } else {
      setGeoState("prompt");
      requestLocation();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const openBrowserLocationSettings = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("chrome")) {
      window.open("chrome://settings/content/location", "_blank");
    } else if (ua.includes("firefox")) {
      window.open("about:preferences#privacy", "_blank");
    } else {
      setGeoError("Please enable location permission for your browser/app, then return and tap Retry.");
    }
  };

  const handleCheckIn = async (e: React.SyntheticEvent) => {
    if (!isGranted || !coords) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.clear();
        navigate('/auth/login');
        return;
      }

      const id_site_employee = id || localStorage.getItem('id_site_employee');
      if (!id_site_employee) {
        Swal.fire({
          title: "Error!",
          text: 'Oops! Something went wrong',
          icon: "error",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
      }

      const time_in = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Singapore',
      }).format(new Date());

      const payload = {
        id_site_employee,
        time_in,
      };

      const response = await attendanceService.storeAttendance(token, payload);

      if (response?.success) {
        Swal.fire({
          title: "Checked in!",
          text: "Successfully checked in.",
          icon: "success",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
        navigate('/user/attendance');
      } else {
        Swal.fire({
          title: "Error!",
          text: 'Oops! Something went wrong',
          icon: "error",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.message || 'Oops! Something went wrong',
        icon: "error",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
        customClass: { popup: "swal2-dark-popup" },
      });
    } finally {
      return;
    }
  };

  const isGranted = geoState === "granted" as GeoState;

  return (
    <div className="relative flex flex-col h-screen bg-white">
      <div className="flex items-center bg-[#181D26] text-white p-4 pt-6 pb-3 gap-3 z-20">
        <Link to="/user/attendance">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-normal text-[#F4F7FF]">Check in</h1>
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-0">
        <MapUser userPos={coords ? { lat: coords.lat, lng: coords.lng } : null} />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white p-6 flex flex-col gap-4 rounded-t-2xl z-10 shadow-lg">
        <div className="flex flex-col gap-1 pt-6">
          <p className="text-xs text-gray-500">Location</p>
          <p className="text-sm font-medium">
            {address
              ? address
              : coords
                ? `Lat: ${coords.lat}, Lng: ${coords.lng}`
                : "Determining your location..."}
          </p>
          {coords?.accuracy !== undefined && (
            <p className="text-[11px] text-gray-500">Accuracy ~ {Math.round(coords.accuracy)} m</p>
          )}
        </div>

        <div className="flex flex-col gap-1 pt-6 pb-6">
          <p className="text-xs text-gray-500">Date & time</p>
          <p className="text-sm font-medium">{dtFormatter.format(now)}</p>
        </div>

        <button
          className="bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isGranted || !coords}
          onClick={handleCheckIn}
        >
          Continue
        </button>
        {!isGranted && <p className="text-xs text-red-500 text-center">Allow location to continue.</p>}
      </div>

      {(!isGranted || geoState === "checking") && (
        <div className="absolute inset-0 z-30 bg-[#181D26] text-white flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4.1L18 21l-6-4-6 4 1.5-7.9L2 9h7l3-7z" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold">Location permission required</h2>
            <p className="text-sm text-white/80">We need your location to continue. Please allow location access when prompted.</p>
            {geoError && <p className="text-xs text-red-400">{geoError}</p>}

            <div className="flex gap-3 mt-2 flex-wrap justify-center">
              <button onClick={requestLocation} className="px-4 py-2 rounded-full bg-[#EFBF04] text-[#181D26] font-medium">
                Retry permission
              </button>
              <button onClick={openBrowserLocationSettings} className="px-4 py-2 rounded-full border border-white/30 text-white">
                Open browser settings
              </button>
            </div>

            <div className="mt-4 text-xs text-white/60 space-y-1">
              <p>Quick tips:</p>
              <p>• Chrome: Settings → Privacy & security → Site settings → Location</p>
              <p>• Safari iOS: Settings → Privacy & Security → Location Services → Safari → Allow</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkin;

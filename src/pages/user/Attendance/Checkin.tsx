import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import MapUser from "../../../components/MapUser";
import attendanceService from "../../../services/attendanceService";
import attendanceSettingService from "../../../services/attendanceSettingService";
import siteEmployeeService from "../../../services/siteEmployeeService";

type GeoState = "checking" | "granted" | "prompt" | "denied" | "unsupported";
type Coords = { lat: number; lng: number; accuracy?: number };

const Checkin = () => {
  const [geoState, setGeoState] = useState<GeoState>("checking");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState<string>("");

  const [now, setNow] = useState<Date>(new Date());
  const [radius, setRadius] = useState<number>(0);
  const [sitePos, setSitePos] = useState<Coords | null>(null);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [within, setWithin] = useState<boolean>(false);

  const { id } = useParams();
  const navigate = useNavigate();

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

  const haversineMeters = (a: Coords, b: Coords) => {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const recalcDistance = (user: Coords | null, site: Coords | null, r: number) => {
    if (!user || !site || !Number.isFinite(r)) {
      setDistanceM(null);
      setWithin(false);
      return;
    }
    const d = haversineMeters(user, site);
    setDistanceM(d);
    setWithin(d <= r);
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
        const c = { lat, lng, accuracy };
        setCoords(c);
        reverseGeocode(lat, lng);
        recalcDistance(c, sitePos, radius);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const settings = await attendanceSettingService.getAttendanceSetting(token);
        const r = Number(settings?.data?.geo_fencing ?? 0);
        setRadius(Number.isFinite(r) ? r : 0);

        let target: Coords | null = null;
        if (id) {
          const se = await siteEmployeeService.getById(token, id);
          const lat = Number(se?.data?.site?.lat ?? se?.data?.lat);
          const lng = Number(se?.data?.site?.long ?? se?.data?.long);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            target = { lat, lng };
          }
        }

        if (!target) {
          const lat = Number(localStorage.getItem("site_lat"));
          const lng = Number(localStorage.getItem("site_lng"));
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            target = { lat, lng };
          }
        }

        setSitePos(target);

        recalcDistance(coords, target, Number.isFinite(r) ? r : 0);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    recalcDistance(coords, sitePos, radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, sitePos]);

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
    e.preventDefault();

    if (!isGranted || !coords) return;

    if (!sitePos || !Number.isFinite(radius) || radius <= 0) {
      await Swal.fire({
        title: "Geofence not configured",
        text: "Site location or radius is missing.",
        icon: "error",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
        customClass: { popup: "swal2-dark-popup" },
      });
      return;
    }

    if (!within) {
      await Swal.fire({
        title: "Outside geofence",
        text:
          distanceM !== null
            ? `You are ~${Math.round(distanceM)} m away. Please move within ${Math.round(radius)} m from the site to check in.`
            : `Please move within ${Math.round(radius)} m from the site to check in.`,
        icon: "warning",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
        customClass: { popup: "swal2-dark-popup" },
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.clear();
        navigate("/auth/login");
        return;
      }

      const id_site_employee = id || localStorage.getItem("id_site_employee");
      if (!id_site_employee) {
        await Swal.fire({
          title: "Error!",
          text: "Oops! Something went wrong",
          icon: "error",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
        return;
      }

      const time_in = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Singapore",
      }).format(new Date());

      const payload: any = {
        id_site_employee,
        time_in,
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracy,
        distance_from_site_m: distanceM !== null ? Math.round(distanceM) : undefined,
      };

      const response = await attendanceService.storeAttendance(token, payload);

      if (response?.success) {
        await Swal.fire({
          title: "Checked in!",
          text: "Successfully checked in.",
          icon: "success",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
        navigate("/user/attendance");
      } else {
        await Swal.fire({
          title: "Error!",
          text: "Oops! Something went wrong",
          icon: "error",
          background: "#1e1e1e",
          confirmButtonColor: "#EFBF04",
          color: "#f4f4f4",
          customClass: { popup: "swal2-dark-popup" },
        });
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Error!",
        text: error?.message || "Oops! Something went wrong",
        icon: "error",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
        customClass: { popup: "swal2-dark-popup" },
      });
    }
  };

  const isGranted: boolean = geoState === "granted";

  const distanceText =
    distanceM === null
      ? "-"
      : distanceM < 1000
        ? `${Math.round(distanceM)} m`
        : `${(distanceM / 1000).toFixed(2)} km`;

  const radiusText =
    !Number.isFinite(radius) || radius <= 0 ? "-" : `${Math.round(radius)} m`;

  const statusBadge = within ? (
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Within geofence</span>
  ) : (
    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Outside geofence</span>
  );

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
        <MapUser
          userPos={coords ? { lat: coords.lat, lng: coords.lng } : null}
          sitePos={sitePos ? { lat: sitePos.lat, lng: sitePos.lng } : null}
          siteRadius={Number.isFinite(radius) ? radius : undefined}
          userAccuracy={coords?.accuracy}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white p-6 flex flex-col gap-4 rounded-t-2xl z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Distance to site</p>
            <p className="text-sm font-medium">{distanceText} (radius {radiusText})</p>
          </div>
          {sitePos && statusBadge}
        </div>

        <div className="flex flex-col gap-1">
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

        <div className="flex flex-col gap-1 pt-2 pb-4">
          <p className="text-xs text-gray-500">Date & time</p>
          <p className="text-sm font-medium">{dtFormatter.format(now)}</p>
        </div>

        <button
          className="bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isGranted || !coords || !sitePos || !within}
          onClick={handleCheckIn}
        >
          {(!sitePos || !Number.isFinite(radius) || radius <= 0)
            ? "Geofence not configured"
            : within
              ? "Continue"
              : "Move closer to the site"}
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

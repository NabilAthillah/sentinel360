// SecondHomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RootState } from "../../../store";
import BottomNavBar from "../components/BottomBar";

import attendanceSettingService from "../../../services/attendanceSettingService";
import siteEmployeeService from "../../../services/siteEmployeeService";
import siteService from "../../../services/siteService";

import { Site } from "../../../types/site";
import { SiteEmployee } from "../../../types/siteEmployee";
import Swal from "sweetalert2";

type Settings = { label: string; placeholder: string; value: string };

type BottomSheetProps = {
  open: boolean;
  site: Site | null;
  message?: string;
  onClose: () => void;
  onProceed: () => void;
};

const BottomSheet = ({
  open,
  site,
  message,
  onClose,
  onProceed,
}: BottomSheetProps) => {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 right-0 bottom-0 w-full transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="rounded-t-2xl w-full md:max-w-2xl mx-auto bg-[#1C1F2A] text-white p-5 shadow-2xl flex flex-col items-center">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <h3 className="text-center text-2xl font-semibold font-caladea text-[#f9f9f9]">
            {site?.name ?? "Nearby site"}
          </h3>
          <p className="text-center mt-5 text-[#f9f9f9]">
            {message ??
              (site
                ? `Scan at ${site.name} to check-in`
                : "You're near a site")}
          </p>
          <button
            onClick={onProceed}
            className="mt-12 w-fit px-11 rounded-full bg-[#EFBF04] py-3 font-medium text-black"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

const SecondHomePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.token.token);
  const { idSite } = useParams<{ idSite: string }>();
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [siteEmployee, setSiteEmployee] = useState<SiteEmployee>();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [nearestSite, setNearestSite] = useState<Site | null>(null);
  const [openSheet, setOpenSheet] = useState(false);

  const geoFencingMeters = useMemo(() => {
    const s = settings.find((d) =>
      d.label.toLowerCase().includes("geo fencing")
    )?.value;
    const v = s ? Number(s) : NaN;
    return Number.isFinite(v) && v > 0 ? v : 100;
  }, [settings]);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // meters
  };

  const fetchSites = async () => {
    if (!token) return;
    try {
      const res = await siteService.getAllSite(token);
      if (res?.success) setSites(res.data);
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };

  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await attendanceSettingService.getAttendanceSetting(token);
      if (res?.success) {
        const d = res.data;
        setSettings([
          {
            label: "Grace period (in minutes)",
            placeholder: "",
            value: String(d.grace_period),
          },
          {
            label: "Geo fencing (in meters)",
            placeholder: "",
            value: String(d.geo_fencing),
          },
          {
            label: "Day shift start time",
            placeholder: "00:00",
            value: d.day_shift_start_time.slice(0, 5),
          },
          {
            label: "Day shift end time",
            placeholder: "00:00",
            value: d.day_shift_end_time.slice(0, 5),
          },
          {
            label: "Night shift start time",
            placeholder: "00:00",
            value: d.night_shift_start_time.slice(0, 5),
          },
          {
            label: "Night shift end time",
            placeholder: "00:00",
            value: d.night_shift_end_time.slice(0, 5),
          },
          {
            label: "RELIEF Day shift start time",
            placeholder: "00:00",
            value: d.relief_day_shift_start_time.slice(0, 5),
          },
          {
            label: "RELIEF Day shift end time",
            placeholder: "00:00",
            value: d.relief_day_shift_end_time.slice(0, 5),
          },
          {
            label: "RELIEF night shift start time",
            placeholder: "00:00",
            value: d.relief_night_shift_start_time.slice(0, 5),
          },
          {
            label: "RELIEF night shift end time",
            placeholder: "00:00",
            value: d.relief_night_shift_end_time.slice(0, 5),
          },
        ]);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const fetchSiteEmployee = async () => {
    if (!token || !user) return;
    try {
      const res = await siteEmployeeService.getNearestSiteUser(token, user);
      if (res?.success) setSiteEmployee(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchSettings();
    fetchSiteEmployee();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (sites.length === 0 || geoFencingMeters <= 0) return;

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        let candidate: { s: Site; d: number } | null = null;
        for (const s of sites) {
          const d = getDistance(
            latitude,
            longitude,
            Number(s.lat),
            Number(s.long)
          );
          if (d <= geoFencingMeters) {
            if (!candidate || d < candidate.d) candidate = { s, d };
          }
        }

        if (candidate) {
          setNearestSite(candidate.s);
          setOpenSheet(true);
        } else {
          setNearestSite(null);
          setOpenSheet(false);
        }

        setTimeout(() => setLoadingLocation(false), 400);
      },
      (error) => {
        console.error(error);
        toast.error("Gagal mendapatkan lokasi");
        setTimeout(() => setLoadingLocation(false), 400);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [sites, geoFencingMeters]);

  const handleProceed = () => {
    navigate(`/user/attendance?siteId=${nearestSite?.id ?? ""}`);
    setOpenSheet(false);
  };

  return (
    <div className="bg-[#0F101C] text-white min-h-screen px-4 pt-6 pb-20">
      <BottomSheet
        open={openSheet}
        site={nearestSite}
        message={
          nearestSite ? `Scan at ${nearestSite.name} to check-in` : undefined
        }
        onClose={() => setOpenSheet(false)}
        onProceed={handleProceed}
      />

      <div className="mt-2 relative">
        <h1 className="text-xl font-bold">{user?.name}</h1>
        <p className="text-sm text-gray-400">
          {user?.role.name} |{" "}
          {user?.nric_fin_no ? "*".repeat(3) + user.nric_fin_no.slice(3) : ""}
        </p>
      </div>

      <div className="flex flex-col gap-6 items-center mt-6">
        <Link
          to="/user/attendance"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3"
        >
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.5 2.75C7.39137 2.75 3.25 6.89137 3.25 12C3.25 17.1086 7.39137 21.25 12.5 21.25C17.6086 21.25 21.75 17.1086 21.75 12C21.75 6.89137 17.6086 2.75 12.5 2.75ZM1.75 12C1.75 6.06294 6.56294 1.25 12.5 1.25C18.4371 1.25 23.25 6.06294 23.25 12C23.25 17.9371 18.4371 22.75 12.5 22.75C6.56294 22.75 1.75 17.9371 1.75 12ZM12.5 7.25C12.9142 7.25 13.25 7.58579 13.25 8V11.6893L15.5303 13.9697C15.8232 14.2626 15.8232 14.7374 15.5303 15.0303C15.2374 15.3232 14.7626 15.3232 14.4697 15.0303L11.9697 12.5303C11.829 12.3897 11.75 12.1989 11.75 12V8C11.75 7.58579 12.0858 7.25 12.5 7.25Z"
              fill="#6992ED"
            />
          </svg>
          <span className="text-white">Attendance</span>
        </Link>

        <div
          onClick={() => {
            if (nearestSite) {
              navigate('/user/guard-tours/${nearestSite?.id}/route')
            } else {
              Swal.fire({
                title: "Error!",
                text: 'There is currently no nearby site.',
                icon: "error",
                background: "#1e1e1e",
                confirmButtonColor: "#EFBF04",
                color: "#f4f4f4",
                customClass: { popup: "swal2-dark-popup" },
              });
            }
          }}
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3 cursor-pointer"
        >
          <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.4999 28.2537L23.8711 28.25C15.2374 28.1975 0.74985 27.6425 0.74985 24.5C0.74985 23.1375 2.94485 22.73 5.9836 22.1675C7.47485 21.8925 10.5799 21.315 10.7511 20.745C10.6061 20.285 8.10485 19.6337 5.09735 19.4987L4.49985 19.4738V18.25L5.74985 18.2825C8.32485 18.4425 11.9999 18.9825 11.9999 20.75C11.9999 22.3237 9.31735 22.82 6.20985 23.3963C4.73485 23.67 2.2686 24.1262 1.98235 24.5712C2.3686 25.7837 12.3874 26.93 23.8761 27H24.4999V28.2537ZM10.7499 5.91625C10.7499 8.765 8.01735 12.625 5.74985 17C3.48235 12.625 0.74985 8.76625 0.74985 5.915C0.73459 5.2464 0.852284 4.58142 1.0961 3.95868C1.33992 3.33593 1.705 2.76781 2.17016 2.2873C2.63532 1.80679 3.19129 1.42346 3.80579 1.15956C4.4203 0.895662 5.0811 0.756447 5.74985 0.75C6.4186 0.756447 7.0794 0.895662 7.69391 1.15956C8.30841 1.42346 8.86438 1.80679 9.32954 2.2873C9.7947 2.76781 10.1598 3.33593 10.4036 3.95868C10.6474 4.58142 10.7651 5.24765 10.7499 5.91625ZM6.4561 13.1063C8.0211 10.325 9.49985 7.7025 9.49985 5.915C9.51602 5.41035 9.43129 4.90755 9.25062 4.43607C9.06996 3.96459 8.797 3.53391 8.44774 3.16929C8.09848 2.80466 7.67996 2.51342 7.21669 2.31264C6.75342 2.11185 6.25473 2.00556 5.74985 2C5.24497 2.00556 4.74628 2.11185 4.28301 2.31264C3.81974 2.51342 3.40121 2.80466 3.05196 3.16929C2.7027 3.53391 2.42974 3.96459 2.24908 4.43607C2.06841 4.90755 1.98368 5.41035 1.99985 5.915C1.99985 7.7025 3.4786 10.3275 5.0436 13.1063C5.2761 13.5213 5.5136 13.9413 5.74985 14.3688C5.98735 13.9413 6.2236 13.5213 6.4561 13.1063ZM8.24985 5.75C8.24985 6.24445 8.10323 6.7278 7.82852 7.13893C7.55382 7.55005 7.16337 7.87048 6.70656 8.0597C6.24974 8.24892 5.74708 8.29843 5.26212 8.20196C4.77717 8.1055 4.33171 7.8674 3.98208 7.51777C3.63245 7.16814 3.39435 6.72268 3.29789 6.23773C3.20142 5.75277 3.25093 5.25011 3.44015 4.79329C3.62937 4.33648 3.9498 3.94603 4.36092 3.67133C4.77205 3.39662 5.2554 3.25 5.74985 3.25C6.41289 3.25 7.04878 3.51339 7.51762 3.98223C7.98646 4.45107 8.24985 5.08696 8.24985 5.75ZM28.2499 14.665C28.2499 17.5163 25.5174 21.375 23.2499 25.75C20.9824 21.375 18.2498 17.5163 18.2498 14.665C18.2287 13.9951 18.3423 13.3277 18.5841 12.7026C18.8258 12.0775 19.1907 11.5073 19.6571 11.0259C20.1235 10.5446 20.6818 10.1618 21.299 9.90043C21.9162 9.63906 22.5796 9.50437 23.2499 9.50437C23.9201 9.50437 24.5835 9.63906 25.2007 9.90043C25.8179 10.1618 26.3762 10.5446 26.8426 11.0259C27.309 11.5073 27.6739 12.0775 27.9156 12.7026C28.1574 13.3277 28.271 13.9951 28.2499 14.665ZM23.9561 21.8563C25.5211 19.075 26.9999 16.4525 26.9999 14.665C27.0225 14.1584 26.9423 13.6525 26.7641 13.1778C26.5858 12.7031 26.3133 12.2694 25.9628 11.9029C25.6124 11.5365 25.1913 11.2448 24.725 11.0455C24.2587 10.8462 23.7569 10.7435 23.2499 10.7435C22.7428 10.7435 22.241 10.8462 21.7747 11.0455C21.3084 11.2448 20.8873 11.5365 20.5369 11.9029C20.1864 12.2694 19.9139 12.7031 19.7356 13.1778C19.5574 13.6525 19.4772 14.1584 19.4998 14.665C19.4998 16.4525 20.9786 19.0775 22.5436 21.8563C22.7761 22.2712 23.0136 22.6912 23.2499 23.1188C23.4874 22.6912 23.7236 22.2712 23.9561 21.8563ZM25.7499 14.5C25.7499 14.9945 25.6032 15.4778 25.3285 15.8889C25.0538 16.3 24.6634 16.6205 24.2066 16.8097C23.7497 16.9989 23.2471 17.0484 22.7621 16.952C22.2772 16.8555 21.8317 16.6174 21.4821 16.2678C21.1325 15.9181 20.8944 15.4727 20.7979 14.9877C20.7014 14.5028 20.7509 14.0001 20.9402 13.5433C21.1294 13.0865 21.4498 12.696 21.8609 12.4213C22.272 12.1466 22.7554 12 23.2499 12C23.9129 12 24.5488 12.2634 25.0176 12.7322C25.4865 13.2011 25.7499 13.837 25.7499 14.5ZM24.4999 14.5C24.4999 14.2528 24.4265 14.0111 24.2892 13.8055C24.1518 13.6 23.9566 13.4398 23.7282 13.3451C23.4998 13.2505 23.2485 13.2258 23.006 13.274C22.7635 13.3222 22.5408 13.4413 22.366 13.6161C22.1912 13.7909 22.0721 14.0137 22.0239 14.2561C21.9756 14.4986 22.0004 14.7499 22.095 14.9784C22.1896 15.2068 22.3498 15.402 22.5554 15.5393C22.761 15.6767 23.0026 15.75 23.2499 15.75C23.5814 15.75 23.8993 15.6183 24.1337 15.3839C24.3682 15.1495 24.4999 14.8315 24.4999 14.5Z"
              fill="#F35A6C"
            />
          </svg>
          <span className="text-white">Guard Tour</span>
        </div>
      </div>

      {!openSheet && <BottomNavBar />}
    </div>
  );
};

export default SecondHomePage;

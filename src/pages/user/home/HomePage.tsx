"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import attendanceSettingService from "../../../services/attendanceSettingService";
import siteEmployeeService from "../../../services/siteEmployeeService";
import siteService from "../../../services/siteService";
import { RootState } from "../../../store";
import { Site } from "../../../types/site";
import { SiteEmployee } from "../../../types/siteEmployee";
import BottomNavBar from "../components/BottomBar";
import SecondHomePage from "./SecondHomePage";

type Settings = {
  label: string;
  placeholder: string;
  value: string;
};

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.token.token);
  const [siteEmployee, setSiteEmployee] = useState<SiteEmployee>();
  const [sites, setSites] = useState<Site[]>([]);
  const [attendance, setAttendance] = useState();
  const [settings, setSettings] = useState<Settings[]>([]);
  const navigate = useNavigate();
  const [isSecondHome, setIsSecondHome] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const fetchSites = async () => {
    try {
      const response = await siteService.getAllSite(token);

      if (response.success) {
        setSites(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSiteEmployee = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await siteEmployeeService.getNearestSiteUser(
        token,
        user
      );

      if (response.success) {
        setSiteEmployee(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await attendanceSettingService.getAttendanceSetting(
        token
      );

      if (response.success) {
        const data = response.data;

        const mappedData = [
          {
            label: "Grace period (in minutes)",
            placeholder: "Grace period (in minutes)",
            value: data.grace_period.toString(),
          },
          {
            label: "Geo fencing (in meters)",
            placeholder: "Geo fencing (in meters)",
            value: data.geo_fencing.toString(),
          },
          {
            label: "Day shift start time",
            placeholder: "00:00",
            value: data.day_shift_start_time.slice(0, 5),
          },
          {
            label: "Day shift end time",
            placeholder: "00:00",
            value: data.day_shift_end_time.slice(0, 5),
          },
          {
            label: "Night shift start time",
            placeholder: "00:00",
            value: data.night_shift_start_time.slice(0, 5),
          },
          {
            label: "Night shift end time",
            placeholder: "00:00",
            value: data.night_shift_end_time.slice(0, 5),
          },
          {
            label: "RELIEF Day shift start time",
            placeholder: "00:00",
            value: data.relief_day_shift_start_time.slice(0, 5),
          },
          {
            label: "RELIEF Day shift end time",
            placeholder: "00:00",
            value: data.relief_day_shift_end_time.slice(0, 5),
          },
          {
            label: "RELIEF night shift start time",
            placeholder: "00:00",
            value: data.relief_night_shift_start_time.slice(0, 5),
          },
          {
            label: "RELIEF night shift end time",
            placeholder: "00:00",
            value: data.relief_night_shift_end_time.slice(0, 5),
          },
        ];

        setSettings(mappedData);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSettingTime = (label: string) => {
    const item = settings.find(
      (d) => d.label.trim().toLowerCase() === label.trim().toLowerCase()
    );
    return item?.value ?? null;
  };

  const toTodayTime = (hhmm: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const fmtHM = (ms: number) => {
    const abs = Math.abs(ms);
    const minutes = Math.floor(abs / 60000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getShiftLabels = (shiftRaw?: string) => {
    const s = (shiftRaw || "").toLowerCase().trim();
    if (s === "day") {
      return { start: "Day shift start time", end: "Day shift end time" };
    }
    if (s === "night") {
      return { start: "Night shift start time", end: "Night shift end time" };
    }
    if (s === "relief day" || s === "relief-day" || s === "relief_day") {
      return {
        start: "RELIEF Day shift start time",
        end: "RELIEF Day shift end time",
      };
    }
    if (s === "relief night" || s === "relief-night" || s === "relief_night") {
      return {
        start: "RELIEF night shift start time",
        end: "RELIEF night shift end time",
      };
    }
    return null;
  };

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

    return R * c;
  };

  const checkLocation = (currentLat: number, currentLng: number) => {
    if (!sites || sites.length === 0) return;

    const geoFencingStr = settings.find((d) =>
      d.label.toLowerCase().includes("geo fencing")
    )?.value;
    const geoFencing = geoFencingStr ? Number(geoFencingStr) : 0;

    if (geoFencing === 0) {
      console.warn("Geo fencing setting tidak ditemukan atau 0");
      return;
    }

    const nearestSite = sites.find((site) => {
      const dist = getDistance(
        currentLat,
        currentLng,
        Number(site.lat),
        Number(site.long)
      );
      return dist <= geoFencing;
    });

    if (!nearestSite) {
      setIsSecondHome(true);
      return;
    }

    if (!siteEmployee || siteEmployee?.site.id !== nearestSite.id) {
      setIsSecondHome(true);
    } else {
      setIsSecondHome(false);
    }
  };

  const [diffLabel, setDiffLabel] = useState<string>("");
  const [isLate, setIsLate] = useState<boolean>(false);

  useEffect(() => {
    if (!siteEmployee || settings.length === 0) return;

    const tick = () => {
      const labels = getShiftLabels(siteEmployee.shift);
      if (!labels) {
        setDiffLabel("");
        setIsLate(false);
        return;
      }

      const startStr = getSettingTime(labels.start);
      const endStr = getSettingTime(labels.end);

      const start = toTodayTime(startStr);
      let end = toTodayTime(endStr);
      const now = new Date();

      if (!start || !end) {
        setDiffLabel("");
        setIsLate(false);
        return;
      }

      if (end.getTime() <= start.getTime()) {
        const e = new Date(end);
        e.setDate(e.getDate() + 1);
        end = e;
      }

      const hasAttendance =
        (siteEmployee as any).attendance != null ||
        (siteEmployee as any).attendancenya != null;

      const target = hasAttendance ? end : start;
      const ms = target.getTime() - now.getTime();

      setIsLate(ms < 0);
      setDiffLabel(fmtHM(ms));
    };

    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [siteEmployee, settings]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/auth/login");
      return;
    }

    fetchSiteEmployee();
    fetchSettings();
    fetchSites();
  }, []);

  useEffect(() => {
    if (settings.length > 0 && sites && navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          checkLocation(latitude, longitude);

          setTimeout(() => {
            setLoadingLocation(false);
          }, 1000);
        },
        (error) => {
          console.error(error);
          toast.error("Gagal mendapatkan lokasi");

          setTimeout(() => {
            setLoadingLocation(false);
          }, 1000);
        }
      );
    }
  }, [settings, sites, siteEmployee]);

  if (loadingLocation) {
    return (
      <div className="bg-[#0F101C] text-white min-h-screen flex items-center justify-center">
        <Loader primary />
      </div>
    );
  }


  if (isSecondHome) {
    return <SecondHomePage />;
  }
  return (
    <div className="bg-[#0F101C] text-white min-h-screen px-4 pt-6 pb-20">
      <div className="mt-2 relative">
        <h1 className="text-xl font-bold">{user?.name}</h1>
        <p className="text-sm text-gray-400">
          {user?.role.name} |{" "}
          {user?.nric_fin_no ? "*".repeat(3) + user.nric_fin_no.slice(3) : ""}
        </p>

        <div className="absolute top-6 right-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="23"
            height="23.172409057617188"
            viewBox="0 0 23 23.172409057617188"
          >
            <g>
              <g></g>
              <g>
                <g>
                  <path
                    d="M18.16290232696533,13.823723231506348L18.16290232696533,9.597263231506346Q18.16290232696533,6.808623231506347,16.210602326965333,4.859263231506348Q14.256002326965332,2.8900232315063477,11.500002326965333,2.8900232315063477Q8.738172326965332,2.8900232315063477,6.785472326965332,4.859563231506348Q4.837072326965332,6.824753231506348,4.837072326965332,9.597263231506346L4.837072326965332,13.823723231506348Q4.080786326965332,13.905023231506348,3.522651226965332,14.467323231506347Q2.872502326965332,15.122323231506348,2.872502326965332,16.046923231506348Q2.872502326965332,16.97142323150635,3.522648026965332,17.626423231506347Q4.175104326965332,18.283823231506346,5.098342326965332,18.283823231506346L17.90170232696533,18.283823231506346Q18.824902326965333,18.283823231506346,19.477402326965333,17.626423231506347Q20.12750232696533,16.97142323150635,20.12750232696533,16.046923231506348Q20.12750232696533,15.122323231506348,19.477402326965333,14.467323231506347Q18.919202326965333,13.905023231506348,18.16290232696533,13.823723231506348ZM17.41290232696533,15.310023231506348L17.90170232696533,15.310023231506348Q18.627502326965335,15.310023231506348,18.627502326965335,16.046923231506348Q18.627502326965335,16.783823231506346,17.90170232696533,16.783823231506346L5.098342326965332,16.783823231506346Q4.372502326965332,16.783823231506346,4.372502326965332,16.046923231506348Q4.372502326965332,15.310023231506348,5.098342326965332,15.310023231506348L5.587072326965332,15.310023231506348Q5.660942326965332,15.310023231506348,5.7333923269653315,15.295623231506347Q5.805842326965331,15.281223231506347,5.874082326965333,15.252923231506347Q5.942332326965332,15.224623231506348,6.003752326965332,15.183623231506347Q6.065172326965332,15.142623231506347,6.1174023269653315,15.090323231506348Q6.169632326965332,15.038123231506347,6.210672326965332,14.976723231506348Q6.2517123269653325,14.915323231506347,6.279982326965332,14.847023231506348Q6.308252326965333,14.778823231506347,6.322662326965332,14.706323231506348Q6.337072326965332,14.633923231506348,6.337072326965332,14.560023231506348L6.337072326965332,9.597263231506346Q6.337072326965332,7.442303231506347,7.8506723269653325,5.915653231506347Q9.363262326965332,4.390023231506348,11.500002326965333,4.390023231506348Q13.631402326965333,4.390023231506348,15.146002326965332,5.915953231506347Q16.66290232696533,7.430603231506348,16.66290232696533,9.597263231506346L16.66290232696533,14.560023231506348Q16.66290232696533,14.633923231506348,16.677302326965332,14.706323231506348Q16.69180232696533,14.778823231506347,16.720002326965332,14.847023231506348Q16.74830232696533,14.915323231506347,16.789302326965334,14.976723231506348Q16.830402326965334,15.038123231506347,16.882602326965333,15.090323231506348Q16.934802326965332,15.142623231506347,16.99630232696533,15.183623231506347Q17.057702326965334,15.224623231506348,17.12590232696533,15.252923231506347Q17.194202326965332,15.281223231506347,17.266602326965334,15.295623231506347Q17.33910232696533,15.310023231506348,17.41290232696533,15.310023231506348Z"
                    fill-rule="evenodd"
                    fill="#FFFFFF"
                    fillOpacity="1"
                  />
                </g>
                <g>
                  <path
                    d="M14.451685129699708,16.79341983795166L8.548375129699707,16.79341983795166Q8.474506629699707,16.79341983795166,8.402057129699706,16.80783083795166Q8.329608129699707,16.822241837951662,8.261362129699707,16.85050983795166Q8.193117129699708,16.87877883795166,8.131697129699708,16.919817837951662Q8.070278129699707,16.96085683795166,8.018045129699708,17.01308983795166Q7.965812129699707,17.065322837951662,7.924773129699707,17.12674183795166Q7.883734129699707,17.18816183795166,7.855465129699707,17.25640683795166Q7.827197129699707,17.32465283795166,7.812786129699707,17.39710183795166Q7.798375129699707,17.46955133795166,7.798375129699707,17.54341983795166Q7.798375129699707,19.08347983795166,8.880956129699706,20.17417983795166Q9.965855129699706,21.26721983795166,11.500025129699708,21.26720983795166Q13.035365129699706,21.26720983795166,14.118505129699706,20.17839983795166Q15.201685129699708,19.08953983795166,15.201685129699708,17.54341983795166Q15.201685129699708,17.46955133795166,15.187275129699707,17.39710183795166Q15.172855129699707,17.32465283795166,15.144595129699706,17.25640683795166Q15.116325129699707,17.18816183795166,15.075285129699708,17.12674183795166Q15.034245129699707,17.065322837951662,14.982015129699708,17.01308983795166Q14.929775129699706,16.96085683795166,14.868355129699708,16.919817837951662Q14.806935129699706,16.87877883795166,14.738695129699707,16.85050983795166Q14.670445129699708,16.822241837951662,14.597995129699708,16.80783083795166Q14.525555129699708,16.79341983795166,14.451685129699708,16.79341983795166ZM9.420466129699706,18.29341983795166Q9.579475129699707,18.74864983795166,9.945575129699707,19.11748983795166Q10.590455129699707,19.76720983795166,11.500025129699708,19.76720983795166Q12.411745129699707,19.76720983795166,13.055075129699707,19.12050983795166Q13.422065129699707,18.75159983795166,13.580765129699707,18.29341983795166L9.420466129699706,18.29341983795166Z"
                    fill-rule="evenodd"
                    fill="#FFFFFF"
                    fillOpacity="1"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {siteEmployee && (
        <Link
          to="/user/attendance"
          className="bg-[#EFBF04] text-[#181D26] p-4 rounded-lg relative mt-4 flex justify-between items-center"
        >
          <div className="flex flex-col">
            <p className="text-sm font-semibold capitalize">
              {siteEmployee.shift} Shift
            </p>
            {/* <p className="text-xs font-normal">{attendance?.value}</p> */}
            <p
              className={`text-xs font-normal ${isLate ? "text-red-400" : "text-[#181D26]"
                }`}
            >
              {siteEmployee?.date
                ? (() => {
                  const dateObj = new Date(siteEmployee.date);
                  const day = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit",
                  });
                  const month = dateObj.toLocaleDateString("en-GB", {
                    month: "long",
                  });
                  const year = dateObj.toLocaleDateString("en-GB", {
                    year: "numeric",
                  });
                  const weekday = dateObj.toLocaleDateString("en-GB", {
                    weekday: "long",
                  });
                  return `${day} ${month} ${year}, ${weekday}`;
                })()
                : "Invalid date"}{" "}
              {diffLabel ? ` | ${diffLabel}` : ""}
            </p>
          </div>

          <div className="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link
          to="/user/e-occurence"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="34"
            height="36"
            viewBox="0 0 34 36"
          >
            <defs>
              <clipPath id="master_svg0_133_01082">
                <rect x="0" y="0" width="34" height="36" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_01082)">
              <g>
                <path
                  d="M29,3.5L8,3.5C6.35,3.5,5,4.85,5,6.5L5,27.5C5,29.15,6.35,30.5,8,30.5L29,30.5C30.65,30.5,32,29.15,32,27.5L32,6.5C32,4.85,30.65,3.5,29,3.5ZM29,27.5L8,27.5L8,6.5L29,6.5L29,27.5Z"
                  fill="#D65B92"
                  fillOpacity="1"
                />
              </g>
              <g>
                <path
                  d="M9.875,10.58L17.375,10.58L17.375,12.83L9.875,12.83L9.875,10.58ZM20,22.625L27.5,22.625L27.5,24.875L20,24.875L20,22.625ZM20,18.875L27.5,18.875L27.5,21.125L20,21.125L20,18.875ZM12.5,26L14.75,26L14.75,23L17.75,23L17.75,20.75L14.75,20.75L14.75,17.75L12.5,17.75L12.5,20.75L9.5,20.75L9.5,23L12.5,23L12.5,26ZM21.634999999999998,15.425L23.75,13.309999999999999L25.865,15.425L27.455,13.835L25.34,11.705L27.455,9.59L25.865,8L23.75,10.115L21.634999999999998,8L20.045,9.59L22.16,11.705L20.045,13.835L21.634999999999998,15.425Z"
                  fill="#D65B92"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className="text-white text-sm">e-Occurrence</span>
        </Link>

        <Link
          to="/user/employee-document"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col items-center justify-center gap-2 w-full py-6 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <defs>
              <clipPath id="master_svg0_133_00798">
                <rect x="0" y="0" width="32" height="32" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_00798)">
              <g>
                <path
                  d="M18.6667,11.999986494140625L18.6667,5.333326494140625L6.66667,5.333326494140625L6.66667,26.666656494140625L14.7413,26.666656494140625C15.1787,27.222656494140626,15.7067,27.713356494140626,16.314700000000002,28.113356494140625L18.168,29.333356494140624L5.324,29.333356494140624C4.593295,29.333356494140624,4.000735919,28.741356494140625,4,28.010656494140626L4,3.989326494140625C4,3.273323494140625,4.598666,2.666656494140625,5.336,2.666656494140625L19.996000000000002,2.666656494140625L28,10.666656494140625L28,11.999986494140625L18.6667,11.999986494140625ZM16,14.666656494140625L28,14.666656494140625L28,22.598656494140624C28,23.918656494140624,27.332,25.153356494140624,26.2187,25.885356494140623L22,28.663956494140624L17.7813,25.885356494140623C16.6726,25.159756494140623,16.0031,23.925056494140627,16,22.599956494140624L16,14.666656494140625ZM18.6667,22.598656494140624C18.6667,23.019956494140626,18.8827,23.417356494140623,19.247999999999998,23.658656494140626L22,25.471956494140624L24.752,23.658656494140626C25.112,23.425856494140625,25.3306,23.027356494140626,25.3333,22.598656494140624L25.3333,17.333356494140624L18.6667,17.333356494140624L18.6667,22.598656494140624Z"
                  fill="#46EADF"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className="text-white text-center flex flex-col ">
            Employe Document
          </span>
        </Link>

        <Link
          to="/user/sop-document"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <defs>
              <clipPath id="master_svg0_133_00984">
                <rect x="0" y="0" width="32" height="32" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_00984)">
              <g>
                <path
                  d="M16.551956494140626,6.66667L27.999956494140626,6.66667C28.736356494140626,6.66667,29.333356494140624,7.2636199999999995,29.333356494140624,8L29.333356494140624,26.6667C29.333356494140624,27.403,28.736356494140626,28,27.999956494140626,28L3.999986494140625,28C3.263610494140625,28,2.666656494140625,27.403,2.666656494140625,26.6667L2.666656494140625,5.33333C2.666656494140625,4.596954,3.263610494140625,4,3.999986494140625,4L13.885356494140625,4L16.551956494140626,6.66667ZM5.333326494140625,6.66667L5.333326494140625,25.3333L26.666656494140625,25.3333L26.666656494140625,9.33333L15.447956494140625,9.33333L12.781356494140624,6.66667L5.333326494140625,6.66667ZM14.666656494140625,12L17.333356494140624,12L17.333356494140624,22.6667L14.666656494140625,22.6667L14.666656494140625,12ZM19.999956494140626,16L22.666656494140625,16L22.666656494140625,22.6667L19.999956494140626,22.6667L19.999956494140626,16ZM9.333326494140625,18.6667L11.999986494140625,18.6667L11.999986494140625,22.6667L9.333326494140625,22.6667L9.333326494140625,18.6667Z"
                  fill="#E5D463"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className="text-white">SOP Documents</span>
        </Link>

        <Link
          to="/user/contact"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <defs>
              <clipPath id="master_svg0_133_01334">
                <rect x="0" y="0" width="32" height="32" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_01334)">
              <g>
                <path
                  d="M26.66656494140625,5.33333L5.33323494140625,5.33333C3.86656494140625,5.33333,2.66656494140625,6.53333,2.66656494140625,8L2.66656494140625,24C2.66656494140625,25.4667,3.86656494140625,26.6667,5.33323494140625,26.6667L26.66656494140625,26.6667C28.13326494140625,26.6667,29.33326494140625,25.4667,29.33326494140625,24L29.33326494140625,8C29.33326494140625,6.53333,28.13326494140625,5.33333,26.66656494140625,5.33333ZM26.66656494140625,24L5.33323494140625,24L5.33323494140625,8L26.66656494140625,8L26.66656494140625,24ZM5.33323494140625,0L26.66656494140625,0L26.66656494140625,2.66667L5.33323494140625,2.66667L5.33323494140625,0ZM5.33323494140625,29.3333L26.66656494140625,29.3333L26.66656494140625,32L5.33323494140625,32L5.33323494140625,29.3333ZM15.99986494140625,16C17.840864941406252,16,19.33326494140625,14.5076,19.33326494140625,12.6667C19.33326494140625,10.8257,17.840864941406252,9.33333,15.99986494140625,9.33333C14.15896494140625,9.33333,12.66656494140625,10.8257,12.66656494140625,12.6667C12.66656494140625,14.5076,14.15896494140625,16,15.99986494140625,16ZM15.99986494140625,11.3333C16.73326494140625,11.3333,17.33326494140625,11.9333,17.33326494140625,12.6667C17.33326494140625,13.4,16.73326494140625,14,15.99986494140625,14C15.26656494140625,14,14.66656494140625,13.4,14.66656494140625,12.6667C14.66656494140625,11.9333,15.26656494140625,11.3333,15.99986494140625,11.3333ZM22.66656494140625,21.32C22.66656494140625,18.5333,18.25326494140625,17.3333,15.99986494140625,17.3333C13.74656494140625,17.3333,9.33323494140625,18.5333,9.33323494140625,21.32L9.33323494140625,22.6667L22.66656494140625,22.6667L22.66656494140625,21.32ZM11.74656494140625,20.6667C12.55989494140625,19.9733,14.45326494140625,19.3333,15.99986494140625,19.3333C17.55986494140625,19.3333,19.45326494140625,19.9733,20.26656494140625,20.6667L11.74656494140625,20.6667Z"
                  fill="#D4863F"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className="text-white">Contacts</span>
        </Link>

        <Link
          to="/user/clocking"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col items-center justify-center gap-2 w-full py-6 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width="32"
            height="32"
            viewBox="0 0 44 44"
          >
            <defs>
              <clipPath id="master_svg0_133_00783">
                <rect x="0" y="0" width="44" height="44" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_00783)">
              <path
                d="M21.99998701171875,3.6666641235351562C11.91668701171875,3.6666641235351562,3.66668701171875,11.916664123535156,3.66668701171875,21.999964123535158C3.66668701171875,32.083364123535155,11.91668701171875,40.333364123535155,21.99998701171875,40.333364123535155C32.08338701171875,40.333364123535155,40.33338701171875,32.083364123535155,40.33338701171875,21.999964123535158C40.33338701171875,11.916664123535156,32.08338701171875,3.6666641235351562,21.99998701171875,3.6666641235351562ZM21.99998701171875,36.666664123535156C13.91498701171875,36.666664123535156,7.33335701171875,30.084964123535155,7.33335701171875,21.999964123535158C7.33335701171875,13.914964123535157,13.91498701171875,7.333334123535156,21.99998701171875,7.333334123535156C30.08498701171875,7.333334123535156,36.66668701171875,13.914964123535157,36.66668701171875,21.999964123535158C36.66668701171875,30.084964123535155,30.08498701171875,36.666664123535156,21.99998701171875,36.666664123535156ZM22.91668701171875,12.833334123535156L20.16668701171875,12.833334123535156L20.16668701171875,23.833364123535155L29.69998701171875,29.699964123535157L31.16668701171875,27.316664123535155L22.91668701171875,22.366664123535156L22.91668701171875,12.833334123535156Z"
                fill="#6091F4"
                fillOpacity="1"
              />
            </g>
          </svg>
          <span className="text-white">Clocking</span>
        </Link>

        <Link
          to="/user/incident"
          className="bg-[#FFFFFF1A] p-4 rounded-xl flex flex-col justify-center items-center gap-2 w-full py-6 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            version="1.1"
            width="34"
            height="34"
            viewBox="0 0 34 34"
          >
            <defs>
              <clipPath id="master_svg0_133_01341">
                <rect x="0" y="0" width="34" height="34" rx="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#master_svg0_133_01341)">
              <g>
                <path
                  d="M17.000114453125,8.485832098999023L27.667614453125,26.916642098999024L6.332594453125,26.916642098999024L17.000114453125,8.485832098999023ZM3.881756453125,25.500042098999025C2.790923453125,27.384142098999025,4.150923453125,29.750042098999025,6.332594453125,29.750042098999025L27.667614453125,29.750042098999025C29.849214453125,29.750042098999025,31.209214453125,27.384142098999025,30.118414453125,25.500042098999025L19.450914453125,7.069162098999024C18.360114453125,5.185000098999024,15.640114453125,5.185000098999024,14.549214453125,7.069162098999024L3.881756453125,25.500042098999025ZM15.583414453125,15.583332098999023L15.583414453125,18.416642098999024C15.583414453125,19.195842098999023,16.220914453124998,19.833342098999026,17.000114453125,19.833342098999026C17.779214453125,19.833342098999026,18.416714453125,19.195842098999023,18.416714453125,18.416642098999024L18.416714453125,15.583332098999023C18.416714453125,14.804172098999024,17.779214453125,14.166672098999024,17.000114453125,14.166672098999024C16.220914453124998,14.166672098999024,15.583414453125,14.804172098999024,15.583414453125,15.583332098999023ZM15.583414453125,22.666642098999024L18.416714453125,22.666642098999024L18.416714453125,25.500042098999025L15.583414453125,25.500042098999025L15.583414453125,22.666642098999024Z"
                  fill="#58E79F"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className="text-white">Incidents</span>
        </Link>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default HomePage;

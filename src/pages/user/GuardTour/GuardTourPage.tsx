import React, { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

import siteService from "../../../services/siteService";
import attendanceService from "../../../services/attendanceService";
import attendanceSettingService from "../../../services/attendanceSettingService";
import siteEmployeeService from "../../../services/siteEmployeeService";

import { Site } from "../../../types/site";
import { SiteEmployee } from "../../../types/siteEmployee";
import Loader from "../../../components/Loader";
import Swal from "sweetalert2";

type Settings = { label: string; placeholder: string; value: string };
type ShiftApi = "day" | "night" | "relief day" | "relief night";

const swalBase = {
  background: "#1e1e1e",
  color: "#f4f4f4",
  confirmButtonColor: "#EFBF04",
} as const;

// --- Time helpers (Asia/Singapore) ---
const todayISOInSG = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

const dateISOInSG = (daysOffset = 0) =>
  new Date(Date.now() + daysOffset * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });

const nowMinutesInSG = () => {
  const parts = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
};

const inRangeClock = (nowMin: number, startMin: number, endMin: number) =>
  startMin <= endMin
    ? nowMin >= startMin && nowMin < endMin
    : nowMin >= startMin || nowMin < endMin;

// --- Shift helpers ---
const parseEmployeeShift = (raw: any): ShiftApi | null => {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " "); // normalize "relief-night" / "relief_night" -> "relief night"
  if (
    s === "day" ||
    s === "night" ||
    s === "relief day" ||
    s === "relief night"
  ) {
    return s as ShiftApi;
  }
  return null;
};

const GuardTourPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.token.token);
  const user = useSelector((state: RootState) => state.user.user);
  const { idSite } = useParams<{ idSite: string }>();

  const [site, setSite] = useState<Site>();
  const [routes, setRoutes] = useState<any[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  // ---- Settings helpers
  const getSetting = (label: string) =>
    settings.find(
      (s) => s.label.trim().toLowerCase() === label.trim().toLowerCase()
    )?.value ?? null;

  const timeToMin = (hhmm?: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
  };

  const getShiftStartEndMin = (shift: ShiftApi) => {
    if (shift === "day") {
      return {
        start: timeToMin(getSetting("Day shift start time")),
        end: timeToMin(getSetting("Day shift end time")),
      };
    }
    if (shift === "night") {
      return {
        start: timeToMin(getSetting("Night shift start time")),
        end: timeToMin(getSetting("Night shift end time")),
      };
    }
    if (shift === "relief day") {
      return {
        start: timeToMin(getSetting("RELIEF Day shift start time")),
        end: timeToMin(getSetting("RELIEF Day shift end time")),
      };
    }
    // relief night
    return {
      start: timeToMin(getSetting("RELIEF night shift start time")),
      end: timeToMin(getSetting("RELIEF night shift end time")),
    };
  };

  const crossesMidnight = (shift: ShiftApi) => {
    const { start, end } = getShiftStartEndMin(shift);
    return start != null && end != null && start > end;
  };

  // ---- Data fetchers
  const fetchSite = async () => {
    if (!token || !idSite) return;
    try {
      const res = await siteService.getSiteById(idSite, token);
      if (res?.success) {
        const s = res.data?.site ?? res.data;
        setSite(s);
        setRoutes(s?.routes ?? []);
      }
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
      console.error(e?.message || e);
    }
  };

  // ---- Gating logic
  useEffect(() => {
    (async () => {
      if (!token || !user?.id || !idSite) return;
      setLoading(true);

      try {
        if (settings.length === 0) {
          await fetchSettings();
        }

        // 1) Try site_employee for this user & site (via nearest API, then check if site matches param)
        let seData: SiteEmployee | undefined;
        let seShift: ShiftApi | null = null;
        let seSiteId: string | null = null;

        try {
          const seRes = await siteEmployeeService.getNearestSiteUser(
            token,
            user
          );
          if (seRes?.success && seRes?.data) {
            seData = seRes.data;
            seShift =
              parseEmployeeShift(seRes.data?.shift) ||
              parseEmployeeShift(seRes.data?.site_employee?.shift) ||
              parseEmployeeShift(seRes.data?.siteEmployee?.shift);
            seSiteId = String(seRes.data?.site?.id ?? "");
          }
        } catch (e) {
          console.warn("[guard-tour] getNearestSiteUser error:", e);
        }

        const dateToday = todayISOInSG();

        if (seData && seSiteId === String(idSite) && seShift) {
          // Handle overnight date for this employed shift
          const { end } = getShiftStartEndMin(seShift);
          const nowMin = nowMinutesInSG();
          const useYesterday =
            crossesMidnight(seShift) && end != null && nowMin < end!;
          const dateForQuery = useYesterday ? dateISOInSG(-1) : dateToday;

          console.log("[guard-tour] employed params", {
            siteId: idSite,
            userId: user?.id,
            shift: seShift,
            dateForQuery,
          });

          // Attendance check for employed shift
          let att = await attendanceService.getAttendanceBySiteUserShift(
            token,
            {
              site_id: String(idSite),
              user_id: user.id,
              shift: seShift,
              date: dateForQuery,
            }
          );

          // Fallback shift string variants if needed
          if (!att?.data?.time_in) {
            const alt1 = (seShift as string).replace(" ", "-");
            const alt2 = (seShift as string).replace(" ", "_");
            for (const alt of [alt1, alt2]) {
              try {
                const res =
                  await attendanceService.getAttendanceBySiteUserShift(token, {
                    site_id: String(idSite),
                    user_id: user.id,
                    shift: alt as any,
                    date: dateForQuery,
                  });
                if (res?.data?.time_in) {
                  att = res;
                  break;
                }
              } catch {}
            }
          }

          console.log("[guard-tour] employed attendance", att);

          const hasIn = !!att?.data?.time_in;
          const hasOut = !!att?.data?.time_out;

          if (hasIn && !hasOut) {
            setAllowed(true);
            setLoading(false);
            return;
          }

          setAllowed(false);
          await Swal.fire({
            ...swalBase,
            icon: "info",
            title: "Guard Tour Locked",
            text: "Access is only available if you have checked in and have not yet checked out for your shift.",
          });
          navigate(-1);
          setLoading(false);
          return;
        }

        // 2) No employed site/shift match → try active relief shift (day or night)
        const now = nowMinutesInSG();
        const rd = getShiftStartEndMin("relief day");
        const rn = getShiftStartEndMin("relief night");

        let reliefShift: ShiftApi | null = null;
        if (
          rd.start != null &&
          rd.end != null &&
          inRangeClock(now, rd.start, rd.end)
        ) {
          reliefShift = "relief day";
        } else if (
          rn.start != null &&
          rn.end != null &&
          inRangeClock(now, rn.start, rn.end)
        ) {
          reliefShift = "relief night";
        }

        console.log("[guard-tour] relief window", {
          reliefShift,
          now,
          rdStart: rd.start,
          rdEnd: rd.end,
          rnStart: rn.start,
          rnEnd: rn.end,
        });

        if (!reliefShift) {
          setAllowed(false);
          await Swal.fire({
            ...swalBase,
            icon: "info",
            title: "Outside Relief Hours",
            text: "Guard Tour is available when a Relief shift is active and you have already checked in.",
          });
          navigate(-1);
          setLoading(false);
          return;
        }

        // Handle overnight date for relief shift (e.g., relief night)
        const { end: reliefEnd } = getShiftStartEndMin(reliefShift);
        const nowMin = nowMinutesInSG();
        const useYesterday =
          crossesMidnight(reliefShift) &&
          reliefEnd != null &&
          nowMin < reliefEnd!;
        const dateForQuery = useYesterday ? dateISOInSG(-1) : dateToday;

        console.log("[guard-tour] relief params", {
          siteId: idSite,
          userId: user?.id,
          shift: reliefShift,
          dateForQuery,
        });

        // Attendance check for relief shift
        let attRelief = await attendanceService.getAttendanceBySiteUserShift(
          token,
          {
            site_id: String(idSite),
            user_id: user.id,
            shift: reliefShift,
            date: dateForQuery,
          }
        );

        // Fallback shift string variants if needed
        if (!attRelief?.data?.time_in) {
          const alt1 = (reliefShift as string).replace(" ", "-");
          const alt2 = (reliefShift as string).replace(" ", "_");
          for (const alt of [alt1, alt2]) {
            try {
              const res = await attendanceService.getAttendanceBySiteUserShift(
                token,
                {
                  site_id: String(idSite),
                  user_id: user.id,
                  shift: alt as any,
                  date: dateForQuery,
                }
              );
              if (res?.data?.time_in) {
                attRelief = res;
                break;
              }
            } catch {}
          }
        }

        console.log("[guard-tour] relief attendance", attRelief);

        const hasInRelief = !!attRelief?.data?.time_in;
        const hasOutRelief = !!attRelief?.data?.time_out;

        if (hasInRelief && !hasOutRelief) {
          setAllowed(true);
          setLoading(false);
          return;
        }

        setAllowed(false);
        await Swal.fire({
          ...swalBase,
          icon: "info",
          title: "Guard Tour Locked",
          text: "Access is only available if you have checked in and have not yet checked out for your shift.",
        });
        navigate(-1);
      } catch (e) {
        console.error("[guard-tour] gating error:", e);
        setAllowed(false);
        await Swal.fire({
          ...swalBase,
          icon: "info",
          title: "Guard Tour Locked",
          text: "Access is only available if you have checked in and have not yet checked out for your shift.",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user?.id, idSite, settings.length]);

  useEffect(() => {
    fetchSite();
  }, [token, idSite]);

  return (
    <div className="min-h-screen bg-[#181D26] text-white">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#222630]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-lg font-medium">Guard Tour</span>
        </button>
        <svg
          width="22"
          height="20"
          viewBox="0 0 22 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.56836 17.75C5.8591 18.4185 6.33878 18.9876 6.94847 19.3873C7.55817 19.787 8.27133 20 9.00036 20C9.72939 20 10.4426 19.787 11.0522 19.3873C11.6619 18.9876 12.1416 18.4185 12.4324 17.75H5.56836Z"
            fill="#374957"
          />
          <path
            d="M16.7939 11.4118L15.4919 7.11951C15.0749 5.61827 14.1684 4.29934 12.9163 3.37213C11.6641 2.44493 10.1381 1.9626 8.58054 2.00172C7.02297 2.04084 5.5231 2.59917 4.31908 3.58806C3.11507 4.57696 2.27591 5.93973 1.93486 7.46001L0.923856 11.6128C0.789481 12.1646 0.782201 12.7397 0.902564 13.2947C1.02293 13.8498 1.26779 14.3702 1.61867 14.8168C1.96956 15.2634 2.41729 15.6245 2.92809 15.8727C3.43889 16.121 3.99942 16.25 4.56736 16.25H13.2051C13.7907 16.25 14.3681 16.1129 14.8911 15.8497C15.4142 15.5864 15.8683 15.2044 16.2171 14.7341C16.566 14.2638 16.7998 13.7183 16.9 13.1414C17.0001 12.5645 16.9638 11.9721 16.7939 11.4118Z"
            fill="#374957"
          />
          <rect x="12" width="10" height="10" rx="5" fill="#19CE74" />
          <path
            d="M15.4078 8V7.55256L17.0882 5.71307C17.2855 5.49763 17.4479 5.31037 17.5755 5.15128C17.7031 4.99053 17.7975 4.83973 17.8588 4.69886C17.9218 4.55634 17.9533 4.4072 17.9533 4.25142C17.9533 4.07244 17.9102 3.9175 17.824 3.78658C17.7395 3.65566 17.6235 3.55457 17.476 3.48331C17.3285 3.41205 17.1628 3.37642 16.9789 3.37642C16.7833 3.37642 16.6126 3.41702 16.4668 3.49822C16.3226 3.57777 16.2108 3.68963 16.1312 3.83381C16.0533 3.97798 16.0144 4.14702 16.0144 4.34091H15.4277C15.4277 4.04261 15.4965 3.78078 15.6341 3.5554C15.7716 3.33002 15.9589 3.15436 16.1958 3.02841C16.4345 2.90246 16.7021 2.83949 16.9988 2.83949C17.2971 2.83949 17.5614 2.90246 17.7917 3.02841C18.0221 3.15436 18.2027 3.32422 18.3336 3.538C18.4645 3.75178 18.53 3.98958 18.53 4.25142C18.53 4.43868 18.496 4.6218 18.4281 4.80078C18.3618 4.9781 18.2458 5.17614 18.0801 5.39489C17.916 5.61198 17.6882 5.87713 17.3965 6.19034L16.253 7.41335V7.45312H18.6195V8H15.4078Z"
            fill="#181D26"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading || allowed === null ? (
          <div className="flex w-full justify-center">
            <Loader primary />
          </div>
        ) : allowed ? (
          routes.map((route) => (
            <button
              key={route.id}
              onClick={() =>
                navigate(`/user/guard-tours/${idSite}/route/${route.id}/point`)
              }
              className="flex items-center justify-between bg-[#222630] hover:bg-[#2a2f3a] px-4 py-3 rounded-md transition text-left"
            >
              <span className="text-sm">{route.name}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))
        ) : (
          <div className="text-center text-sm text-white/70">
            Access denied.
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardTourPage;

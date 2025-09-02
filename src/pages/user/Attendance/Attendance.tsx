import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../../components/Loader";
import attendanceService from "../../../services/attendanceService";
import attendanceSettingService from "../../../services/attendanceSettingService";
import siteEmployeeService from "../../../services/siteEmployeeService";
import siteService from "../../../services/siteService";
import { RootState } from "../../../store";
import BottomNavBar from "../components/BottomBar";
import { SiteEmployee } from "../../../types/siteEmployee";

type Settings = { label: string; placeholder: string; value: string };
type Coords = { lat: number; lng: number };
type MiniSite = { id: string; lat: any; long: any; name?: string };

type Shift = "day" | "night" | "relief-day" | "relief-night";
type ShiftDisplay = "day" | "night" | "relief day" | "relief night";

type Decision =
  | {
      canAttend: true;
      siteSource: "param" | "nearest";
      siteId: string;
      shift: Shift;
      shiftFrom: "employee" | "relief";
      note?: string;
    }
  | {
      canAttend: false;
      siteSource: "param" | "nearest" | "none";
      reason: string;
      note?: string;
    };

const Attendance = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [attendanceSetting, setAttendanceSetting] = useState<Settings[]>([]);
  const [settingsReady, setSettingsReady] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [employeeDateISO, setEmployeeDateISO] = useState<string | null>(null);

  const [siteEmployeeDate, setSiteEmployeeDate] = useState<string | null>(null);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [checkInText, setCheckInText] = useState("--:--");
  const [checkOutText, setCheckOutText] = useState("--:--");
  const [effectiveText, setEffectiveText] = useState("0h0m");

  const [siteEmployees, setSiteEmployees] = useState<SiteEmployee[]>([]);

  const [nowSG, setNowSG] = useState<{ hhmmss: string; minutes: number }>({
    hhmmss: "00:00:00",
    minutes: 0,
  });

  const [cta, setCta] = useState<{ label: string; disabled: boolean }>({
    label: "Let's check in",
    disabled: true,
  });

  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await attendanceSettingService.getAttendanceSetting(
        token
      );
      if (response.success) {
        const d = response.data;
        const mapped: Settings[] = [
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
        ];
        setAttendanceSetting(mapped);
        setSettingsReady(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSetting = (label: string) =>
    attendanceSetting.find(
      (s) => s.label.trim().toLowerCase() === label.trim().toLowerCase()
    )?.value ?? null;

  const timeToMin = (hhmm?: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map((n) => Number(n));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };

  const inRange = (nowMin: number, startMin: number, endMin: number) => {
    if (startMin <= endMin) return nowMin >= startMin && nowMin < endMin;
    return nowMin >= startMin || nowMin < endMin;
  };

  const decideReliefShift = (): "relief-day" | "relief-night" | null => {
    const nowMin = nowMinutesInSG();

    const rdS = timeToMin(getSetting("RELIEF Day shift start time"));
    const rdE = timeToMin(getSetting("RELIEF Day shift end time"));
    const rnS = timeToMin(getSetting("RELIEF night shift start time"));
    const rnE = timeToMin(getSetting("RELIEF night shift end time"));

    if (rdS != null && rdE != null && inRange(nowMin, rdS, rdE))
      return "relief-day";
    if (rnS != null && rnE != null && inRange(nowMin, rnS, rnE))
      return "relief-night";
    return null;
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

  const pickNearestSiteWithin = (
    sites: MiniSite[],
    me: Coords,
    maxDistMeters: number
  ) => {
    let best: { site: MiniSite; dist: number } | null = null;
    for (const s of sites) {
      const lat = Number(s.lat);
      const lng = Number(s.long);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const dist = haversineMeters(me, { lat, lng });
      if (dist <= maxDistMeters && (!best || dist < best.dist))
        best = { site: s, dist };
    }
    return best;
  };

  const parseEmployeeShift = (raw: any): Shift | null => {
    const s = String(raw ?? "")
      .trim()
      .toLowerCase();
    if (s === "day") return "day";
    if (s === "night") return "night";
    if (s === "relief day" || s === "relief-day" || s === "relief_day")
      return "relief-day";
    if (s === "relief night" || s === "relief-night" || s === "relief_night")
      return "relief-night";
    return null;
  };

  const formatHumanDate = (input: string | Date) => {
    const d = typeof input === "string" ? new Date(input) : input;
    const safe = isNaN(d.getTime()) ? new Date() : d;
    return safe.toLocaleDateString("en-SG", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Singapore",
    });
  };

  const fmtHM = (s?: string | null) => (s ? s.replace(":", ".") : "--:--");

  const toHM = (val?: string | null) => {
    if (!val) return "--:--";
    const m = val.match(/(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "--:--";
  };

  const diffHM = (startISO: string, endISO: string) => {
    const start = new Date(startISO).getTime();
    const end = new Date(endISO).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
      return "0h0m";
    const min = Math.floor((end - start) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m}m`;
  };

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

  const nowSingaporeParts = () => {
    const parts = new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const ss = Number(parts.find((p) => p.type === "second")?.value ?? "0");
    const two = (n: number) => n.toString().padStart(2, "0");
    return {
      hhmmss: `${two(hh)}:${two(mm)}:${two(ss)}`,
      minutes: hh * 60 + mm,
    };
  };

  const getGraceMin = () => {
    const v = Number(getSetting("Grace period (in minutes)") ?? 0);
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  };

  const getShiftStartEndMin = (shift: typeof currentShift) => {
    if (!shift) return { start: null, end: null };
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
    if (shift === "relief-day") {
      return {
        start: timeToMin(getSetting("RELIEF Day shift start time")),
        end: timeToMin(getSetting("RELIEF Day shift end time")),
      };
    }
    if (shift === "relief-night") {
      return {
        start: timeToMin(getSetting("RELIEF night shift start time")),
        end: timeToMin(getSetting("RELIEF night shift end time")),
      };
    }
    return { start: null, end: null };
  };

  const inRangeClock = (nowMin: number, startMin: number, endMin: number) => {
    if (startMin <= endMin) return nowMin >= startMin && nowMin < endMin;
    return nowMin >= startMin || nowMin < endMin;
  };

  const toShiftDisplay = (s: Shift | null): ShiftDisplay | "-" => {
    if (!s) return "-";
    if (s === "relief-day") return "relief day";
    if (s === "relief-night") return "relief night";
    return s;
  };

  const toApiShift = (
    s: "day" | "night" | "relief-day" | "relief-night"
  ): "day" | "night" | "relief day" | "relief night" => {
    if (s === "relief-day") return "relief day";
    if (s === "relief-night") return "relief night";
    return s;
  };

  const todayISOInSG = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

  const persistCheckinContext = async () => {
    if (!currentSiteId || !currentShift) return;

    localStorage.setItem("site_id", currentSiteId);
    localStorage.setItem("shift_api", toApiShift(currentShift));

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const siteRes = await siteService.getSiteById(currentSiteId, token);
      const lat = Number(siteRes?.data?.lat ?? siteRes?.data?.site?.lat);
      const lng = Number(siteRes?.data?.long ?? siteRes?.data?.site?.long);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        localStorage.setItem("site_lat", String(lat));
        localStorage.setItem("site_lng", String(lng));
      }
    } catch {
      return;
    }
  };

  const minToHM = (min: number | null) => {
    if (min == null || !Number.isFinite(min)) return "--:--";
    const m = ((min % 1440) + 1440) % 1440;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const to12h = (val?: string | null) => {
    if (!val) return "--:--";
    const m = val.match(/(\d{2}):(\d{2})/);
    if (!m) return "--:--";
    let h = parseInt(m[1], 10);
    const minutes = m[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const getEffectiveTime = (
    tIn?: string | null,
    tOut?: string | null,
    dateISO?: string
  ) => {
    if (!tIn || !tOut) return "0h0m";
    const base = dateISO ?? todayISOInSG();
    let endDate = base;
    if (tOut.slice(0, 5) < tIn.slice(0, 5)) {
      const d = new Date(`${base}T00:00:00`);
      d.setDate(d.getDate() + 1);
      endDate = d.toISOString().slice(0, 10);
    }
    const startISO = tIn.length > 10 ? tIn : `${base}T${tIn}`;
    const endISO = tOut.length > 10 ? tOut : `${endDate}T${tOut}`;
    return diffHM(startISO, endISO);
  };

  const startEndOf = (rawShift: any) => {
    const shift = parseEmployeeShift(rawShift);
    if (!shift)
      return {
        start: "--:--",
        end: "--:--",
        meta: { isDay: true, title: "-" },
      };

    const { start, end } = getShiftStartEndMin(shift);
    const title =
      shift === "day"
        ? "Day"
        : shift === "night"
        ? "Night"
        : shift === "relief-day"
        ? "Relief Day"
        : "Relief Night";
    const isDay = shift === "day" || shift === "relief-day";

    return {
      start: fmtHM(minToHM(start)),
      end: fmtHM(minToHM(end)),
      meta: { isDay, title },
    };
  };

  const positionOnce = (opts: PositionOptions) =>
    new Promise<Coords>((resolve, reject) => {
      if (!("geolocation" in navigator))
        return reject(new Error("Geolocation unsupported"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        opts
      );
    });

  const warmupPosition = (timeoutMs = 15000) =>
    new Promise<Coords>((resolve, reject) => {
      if (!("geolocation" in navigator))
        return reject(new Error("Geolocation unsupported"));
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          navigator.geolocation.clearWatch(watchId);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      const t = setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        reject(new Error("Warmup timeout"));
      }, timeoutMs);
    });

  const queryGeoPermission = async (): Promise<PermissionState | null> => {
    try {
      const p = await navigator.permissions.query({ name: "geolocation" });
      return p.state as PermissionState;
    } catch {
      return null;
    }
  };

  const secureContextOk = () =>
    typeof window !== "undefined" &&
    (window.isSecureContext || window.location.hostname === "localhost");

  const mapGeoError = (err: GeolocationPositionError | Error) => {
    const code = (err as GeolocationPositionError)?.code;
    if (code === 1)
      return "Permission denied. Please allow Location for this site.";
    if (code === 2)
      return "Position unavailable. Turn on GPS/Wi-Fi location and try again.";
    if (code === 3)
      return "Location timeout. Please move to open area or try again.";
    return (err as Error)?.message || "Unable to get current location.";
  };

  const getCurrentCoords = async (): Promise<Coords> => {
    if (!secureContextOk()) {
      throw new Error(
        "This page needs HTTPS (or run on localhost) to access location."
      );
    }

    const perm = await queryGeoPermission();
    if (perm === "denied") {
      throw new Error(
        "Location permission is blocked. Allow it in your browser site settings."
      );
    }

    try {
      return await positionOnce({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 120000,
      });
    } catch {
      try {
        return await positionOnce({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      } catch {
        return await warmupPosition(15000);
      }
    }
  };

  const headerDateText = useMemo(() => {
    return formatHumanDate(siteEmployeeDate ?? new Date());
  }, [siteEmployeeDate]);

  const headerTimeText = useMemo(() => {
    const map = {
      day: [
        getSetting("Day shift start time"),
        getSetting("Day shift end time"),
      ],
      night: [
        getSetting("Night shift start time"),
        getSetting("Night shift end time"),
      ],
      "relief-day": [
        getSetting("RELIEF Day shift start time"),
        getSetting("RELIEF Day shift end time"),
      ],
      "relief-night": [
        getSetting("RELIEF night shift start time"),
        getSetting("RELIEF night shift end time"),
      ],
    } as const;

    if (!currentShift) return "--:-- - --:--";
    const [start, end] = map[currentShift] ?? [null, null];
    if (!start || !end) return "--:-- - --:--";
    return `${fmtHM(start)} - ${fmtHM(end)}`;
  }, [currentShift, attendanceSetting, getSetting]);

  const geoRadius = useMemo(() => {
    const v = Number(getSetting("Geo fencing (in meters)") ?? 0);
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  }, [attendanceSetting]);

  const shiftText = toShiftDisplay(currentShift);

  const shiftIconKind = useMemo<"sun" | "moon" | null>(() => {
    if (!currentShift) return null;
    return currentShift === "day" || currentShift === "relief-day"
      ? "sun"
      : "moon";
  }, [currentShift]);

  const handleCtaClick = async () => {
    if (cta.disabled) return;
    if (!currentSiteId || !currentShift || !user?.id) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const dateISO = employeeDateISO ?? todayISOInSG();

    const swalBase = {
      background: "#1e1e1e",
      color: "#f4f4f4",
      confirmButtonColor: "#EFBF04",
    } as const;

    try {
      const hasIn = !!(checkInText && checkInText !== "--:--");
      const hasOut = !!(checkOutText && checkOutText !== "--:--");

      if (!hasIn) {
        await persistCheckinContext();
        navigate("/user/attendance/checkin");
        setLoading(false);
        return;
      }

      if (hasIn && !hasOut) {
        const { start, end } = getShiftStartEndMin(currentShift);
        const grace = getGraceMin();
        const now = nowMinutesInSG();
        const inCheckoutWindow =
          start != null && end != null
            ? inRangeClock(now, end!, (end! + grace) % 1440)
            : false;
        const withinShiftBody =
          start != null && end != null
            ? inRangeClock(now, start!, end!)
            : false;

        let payload: any = {
          site_id: currentSiteId,
          user_id: user.id,
          shift: toApiShift(currentShift),
          date: dateISO,
        };

        if (!inCheckoutWindow && withinShiftBody) {
          const { isConfirmed, value } = await Swal.fire({
            ...swalBase,
            icon: "question",
            title: "Early check-out",
            text: "Please provide a reason for early check-out.",
            input: "textarea",
            inputPlaceholder: "Type your reason...",
            inputValidator: (v) =>
              !v || !String(v).trim() ? "Reason is required" : undefined,
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
          });

          if (!isConfirmed) {
            setLoading(false);
            return;
          }

          payload = { ...payload, early: true, reason: String(value).trim() };
        }

        const res = await attendanceService.checkOut(token, payload);

        await Swal.fire({
          ...swalBase,
          icon: "success",
          title: payload.early ? "Early check-out submitted" : "Checked out",
          text:
            res?.message ??
            (payload.early
              ? "Reason submitted. You have checked out early."
              : "Successfully checked out."),
        });
      }

      const refreshed = await attendanceService.getAttendanceBySiteUserShift(
        token,
        {
          site_id: currentSiteId,
          user_id: user.id,
          shift: toApiShift(currentShift),
          date: dateISO,
        }
      );

      if (refreshed?.success && refreshed?.data) {
        const tIn = refreshed.data.time_in as string | null | undefined;
        const tOut = refreshed.data.time_out as string | null | undefined;

        setCheckInText(toHM(tIn));
        setCheckOutText(toHM(tOut));

        if (tIn && tOut) {
          const startISO = tIn.length > 10 ? tIn : `${dateISO}T${tIn}`;
          const endISO = tOut.length > 10 ? tOut : `${dateISO}T${tOut}`;
          setEffectiveText(diffHM(startISO, endISO));
        } else {
          setEffectiveText("0h0m");
        }

        initAttendanceDecision();
      }
    } catch (e: any) {
      await Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Failed",
        text: e?.message ?? "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runNearestFlow = async (token: string) => {
    if (geoRadius <= 0) {
      await Swal.fire({
        title: "No nearby site",
        text: "Unable to find a nearby site. Please move closer to a site or contact admin.",
        icon: "info",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
      });
      setDecision({
        canAttend: false,
        siteSource: "none",
        reason: "No siteId & nearest disabled",
      });
      return;
    }

    let me: Coords;
    try {
      me = await getCurrentCoords();
    } catch (e: any) {
      await Swal.fire({
        title: "Location unavailable",
        text:
          `${mapGeoError(e)}\n\nQuick checks:\n• Turn on GPS & Wi-Fi\n` +
          `• Disable Battery Saver\n• Make sure site has Location permission (padlock icon → Site settings → Location: Allow)\n` +
          `• Use HTTPS (or localhost during dev)`,
        icon: "warning",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
      });
      setDecision({
        canAttend: false,
        siteSource: "none",
        reason: "Location unavailable",
      });
      return;
    }

    const all = await siteService.getAllSite(token);
    const sites: MiniSite[] = all?.data ?? [];
    const nearest = pickNearestSiteWithin(sites, me, geoRadius);
    if (!nearest) {
      await Swal.fire({
        title: "No nearby site",
        text: "No site detected within the geofence distance.",
        icon: "warning",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
      });
      setDecision({
        canAttend: false,
        siteSource: "none",
        reason: "No siteId & no nearest site",
      });
      return;
    }

    const nLat = Number(nearest.site.lat);
    const nLng = Number(nearest.site.long);
    if (Number.isFinite(nLat) && Number.isFinite(nLng)) {
      localStorage.setItem("site_lat", String(nLat));
      localStorage.setItem("site_lng", String(nLng));
    }
    if (nearest.site.id) {
      localStorage.setItem("site_id", String(nearest.site.id));
    }

    try {
      if (user) {
        const seRes = await siteEmployeeService.getNearestSiteUser(token, user);
        if (seRes?.success && seRes?.data) {
          const empShift =
            parseEmployeeShift(seRes?.data?.shift) ||
            parseEmployeeShift(seRes?.data?.site_employee?.shift) ||
            parseEmployeeShift(seRes?.data?.siteEmployee?.shift);

          const seSiteId = String(seRes.data.site?.id ?? "");
          if (empShift && seSiteId === String(nearest.site.id)) {
            const seId =
              seRes?.data?.site_employee?.id ??
              seRes?.data?.siteEmployee?.id ??
              seRes?.data?.id;
            if (seId) localStorage.setItem("id_site_employee", String(seId));

            const sLat = Number(seRes?.data?.site?.lat);
            const sLng = Number(seRes?.data?.site?.long);
            if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
              localStorage.setItem("site_lat", String(sLat));
              localStorage.setItem("site_lng", String(sLng));
            }
            if (seRes?.data?.site?.id) {
              localStorage.setItem("site_id", String(seRes.data.site.id));
            }

            const dec: Decision = {
              canAttend: true,
              siteSource: "nearest",
              siteId: seSiteId,
              shift: empShift,
              shiftFrom: "employee",
              note: "Attend using siteEmployee.shift (nearest)",
            };
            setDecision(dec);
            setCurrentShift(empShift);
            setCurrentSiteId(seSiteId);
            const seDate = (seRes?.data?.date ??
              seRes?.data?.site_employee?.date ??
              seRes?.data?.siteEmployee?.date) as string | undefined;
            if (seDate) setEmployeeDateISO(seDate.slice(0, 10));
            return;
          }
        }
      }
    } catch (e) {
      console.error("[attendance] getNearestSiteUser error (nearest flow):", e);
    }

    const rel = decideReliefShift();
    if (rel) {
      const chosenSiteId = String(nearest.site.id);
      const dec: Decision = {
        canAttend: true,
        siteSource: "nearest",
        siteId: chosenSiteId,
        shift: rel,
        shiftFrom: "relief",
      };
      setDecision(dec);
      setCurrentShift(rel);
      setCurrentSiteId(chosenSiteId);
    } else {
      await Swal.fire({
        title: "Not in relief window",
        text: "Current time is not within the Relief Day/Night window.",
        icon: "warning",
        background: "#1e1e1e",
        confirmButtonColor: "#EFBF04",
        color: "#f4f4f4",
      });
      setDecision({
        canAttend: false,
        siteSource: "nearest",
        reason: "Current time does not fall into Relief Day/Night",
      });
    }
  };

  const initAttendanceDecision = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[attendance] no token");
      return;
    }
    if (!settingsReady) {
      console.log("[attendance] settings not ready yet");
      return;
    }

    const siteIdParam = searchParams.get("siteId");

    try {
      if (siteIdParam) {
        const siteRes = await siteService.getSiteById(siteIdParam, token);
        if (!siteRes?.success || !siteRes?.data) {
          console.log("[attendance] site not found for param id:", siteIdParam);
          await runNearestFlow(token);
          return;
        }

        const pLat = Number(siteRes?.data?.lat);
        const pLng = Number(siteRes?.data?.long);
        if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
          localStorage.setItem("site_lat", String(pLat));
          localStorage.setItem("site_lng", String(pLng));
        }
        localStorage.setItem("site_id", String(siteIdParam));

        if (user) {
          try {
            const seRes = await siteEmployeeService.getNearestSiteUser(
              token,
              user
            );
            if (seRes?.success && seRes?.data) {
              if (seRes.data?.date) setSiteEmployeeDate(seRes.data.date);

              const empShift =
                parseEmployeeShift(seRes?.data?.shift) ||
                parseEmployeeShift(seRes?.data?.site_employee?.shift) ||
                parseEmployeeShift(seRes?.data?.siteEmployee?.shift);

              const seId =
                seRes?.data?.site_employee?.id ??
                seRes?.data?.siteEmployee?.id ??
                seRes?.data?.id;
              if (seId) localStorage.setItem("id_site_employee", String(seId));
              const sLat = Number(seRes?.data?.site?.lat);
              const sLng = Number(seRes?.data?.site?.long);
              if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
                localStorage.setItem("site_lat", String(sLat));
                localStorage.setItem("site_lng", String(sLng));
              }
              if (seRes?.data?.site?.id) {
                localStorage.setItem("site_id", String(seRes.data.site.id));
              }

              if (empShift) {
                const dec: Decision = {
                  canAttend: true,
                  siteSource: "param",
                  siteId: String(siteIdParam),
                  shift: empShift,
                  shiftFrom: "employee",
                  note: "Attend using siteEmployee.shift",
                };
                setDecision(dec);
                setCurrentShift(empShift);
                setCurrentSiteId(String(siteIdParam));
                const seDate = (seRes?.data?.date ??
                  seRes?.data?.site_employee?.date ??
                  seRes?.data?.siteEmployee?.date) as string | undefined;
                if (seDate) setEmployeeDateISO(seDate.slice(0, 10));
                return;
              }
            }
          } catch (e) {
            console.error(
              "[attendance] getNearestSiteUser error (param branch):",
              e
            );
          }
        }

        const rel = decideReliefShift();
        if (rel) {
          const dec: Decision = {
            canAttend: true,
            siteSource: "param",
            siteId: String(siteIdParam),
            shift: rel,
            shiftFrom: "relief",
          };
          setDecision(dec);
          setCurrentShift(rel);
          setCurrentSiteId(String(siteIdParam));
          return;
        }

        await runNearestFlow(token);
        return;
      }

      await runNearestFlow(token);
    } catch (err) {
      console.error("[attendance] init error:", err);
    }
  };

  const fetchSiteEmployees = async () => {
    try {
      const response = await siteEmployeeService.getAllSiteUser(user);

      if (response.success) {
        setSiteEmployees(response.datas);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchSiteEmployees();
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    initAttendanceDecision();
  }, [settingsReady, geoRadius, searchParams]);

  useEffect(() => {
    const run = async () => {
      if (decision?.canAttend !== true) return;
      if (!currentSiteId || !currentShift) return;

      const token = localStorage.getItem("token");
      if (!token || !user?.id) return;

      const dateISO = employeeDateISO ?? todayISOInSG();

      try {
        const res = await attendanceService.getAttendanceBySiteUserShift(
          token,
          {
            site_id: currentSiteId,
            user_id: user.id,
            shift: toApiShift(currentShift),
            date: dateISO,
          }
        );

        if (res?.success && res?.data) {
          const tIn = res.data.time_in as string | null | undefined;
          const tOut = res.data.time_out as string | null | undefined;

          setCheckInText(toHM(tIn));
          setCheckOutText(toHM(tOut));
          if (tIn && tOut) {
            const startISO = tIn.length > 10 ? tIn : `${dateISO}T${tIn}`;
            const endISO = tOut.length > 10 ? tOut : `${dateISO}T${tOut}`;
            setEffectiveText(diffHM(startISO, endISO));
          } else {
            setEffectiveText("0h0m");
          }
        } else {
          setCheckInText("--:--");
          setCheckOutText("--:--");
          setEffectiveText("0h0m");
        }
      } catch (e) {
        console.error("[attendance] fetch attendance error:", e);
        setCheckInText("--:--");
        setCheckOutText("--:--");
        setEffectiveText("0h0m");
      }
    };
    run();
  }, [
    decision?.canAttend,
    currentSiteId,
    currentShift,
    user?.id,
    employeeDateISO,
  ]);

  useEffect(() => {
    const tick = () => setNowSG(nowSingaporeParts());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!currentShift) {
      setCta({ label: "-", disabled: true });
      return;
    }
    const { start, end } = getShiftStartEndMin(currentShift);
    const grace = getGraceMin();
    if (start == null || end == null) {
      setCta({ label: "-", disabled: true });
      return;
    }

    const now = nowSG.minutes;
    const hasIn = checkInText && checkInText !== "--:--";
    const hasOut = checkOutText && checkOutText !== "--:--";

    const startPlusGrace = (start + grace) % 1440;
    const endPlusGrace = (end + grace) % 1440;

    const inCheckinWindow = inRangeClock(now, start, startPlusGrace);
    const inCheckoutWindow = inRangeClock(now, end, endPlusGrace);
    const withinShiftBody = inRangeClock(now, start, end);

    const beforeStart = start <= end ? now < start : now >= end && now < start;

    if (hasIn && hasOut) {
      setCta({ label: "You've already checked out", disabled: true });
      return;
    }

    if (hasIn && !hasOut) {
      if (inCheckoutWindow) {
        setCta({ label: "Let's check out", disabled: false });
        return;
      }
      if (withinShiftBody) {
        setCta({ label: "Check out early", disabled: false });
        return;
      }
      setCta({ label: "You are late for check-out", disabled: true });
      return;
    }

    if (!hasIn) {
      if (inCheckinWindow) {
        setCta({ label: "Let's check in", disabled: false });
        return;
      }
      if (beforeStart) {
        setCta({ label: "Check-in window hasn't started yet", disabled: true });
        return;
      }
      setCta({ label: "You are late for check-in", disabled: true });
      return;
    }

    setCta({ label: "-", disabled: true });
  }, [
    nowSG.minutes,
    currentShift,
    attendanceSetting,
    checkInText,
    checkOutText,
  ]);

  return (
    <div className="bg-[#181D26] min-h-screen text-white flex flex-col gap-12">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="rounded-lg flex flex-col gap-6 justify-between px-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="font-medium text-base">{headerDateText}</h2>

              <p className="text-sm text-[#98A1B3]">{headerTimeText}</p>
            </div>

            {shiftIconKind ? (
              <div className="flex items-center gap-1 text-sm text-[#F4F7FF] h-full">
                {shiftIconKind === "sun" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M4.51 3.23L3.31 2.03l-.94.94 1.19 1.19 1.94-1.93zM2.67 7H.67v1.33h2V7zM8.67.37H7.33v2h1.33v-2zM13.63 2.97l-.94-.94-1.19 1.19 1.19 1.19 1.94-1.93zM11.49 12.11l1.19 1.2.94-.94-1.2-1.19-.93.93zM13.33 7v1.33h2V7h-2zM8 3.67A4 4 0 1 0 12 7.67 4 4 0 0 0 8 3.67zM7.33 14.97h1.33v-1.97H7.33v1.97zM2.37 12.36l.94.94 1.19-1.2-.94-.94-1.19 1.2z"
                      fill="#F3C511"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M9.796 3.018c.157-.414-.21-.846-.653-.781-3.22.467-5.525 3.541-4.865 6.93.455 2.345 2.385 4.206 4.748 4.59 2.181.356 4.176-.507 5.436-2.006.28-.333.111-.864-.321-.945-3.512-.671-5.647-4.399-4.345-7.788z"
                      fill="#33569F"
                    />
                  </svg>
                )}
                <span className="text-[#F4F7FF] capitalize">
                  {shiftText} Shift
                </span>
              </div>
            ) : (
              <p>-</p>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-[#98A1B3] text-xs font-normal">Check in</p>
                <p className="text-[#19CE74] font-normal text-xs">
                  {checkInText}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[#98A1B3] text-xs font-normal">Check out</p>
                <p className="text-[#FF7E6A] font-normal text-xs">
                  {checkOutText}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[#98A1B3] text-xs font-normal">
                Effective hours
              </p>
              <p className="text-[#F4F7FF] text-xs font-normal">
                {effectiveText}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCtaClick}
          disabled={cta.disabled}
          className={`rounded-full flex flex-wrap justify-center gap-3 items-center w-full py-[13.5px] bg-[#EFBF04] ${
            cta.disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {cta.label != "-" && !loading ? (
            <>
              <span className="flex text-[#181D26] text-base font-bold gap-2 text-center w-fit font-inter">
                {cta.label}
              </span>
              <span className="flex text-[#181D26] text-base font-bold gap-2 text-center w-fit font-inter">
                |
              </span>
              <span className="flex text-[#181D26] text-base font-bold gap-2 text-center w-fit font-inter">
                {nowSG.hhmmss}
              </span>
            </>
          ) : (
            <Loader primary />
          )}
        </button>
      </div>

      <div className="h-full w-full flex flex-col flex-1 gap-4 pb-16">
        <h3 className="text-[#98A1B3] text-base font-normal px-6">History</h3>

        <div className="bg-white rounded-t-3xl px-6 py-[26px] text-[#0F1116] flex flex-col gap-6 flex-1">
          {siteEmployees.length === 0 ? (
            <div className="flex flex-col flex-1 gap-[35px] items-center justify-start h-full py-[30px]">
              <div className="w-[185px] h-[169px] bg-[#D8D8D8]/40 "></div>
              <div className="flex flex-col gap-2">
                <h3 className="font-noto text-xl text-[#181D26]">
                  No data available
                </h3>
                <p className="font-inter text-sm text-[#181D26]">
                  No attendance completed yet
                </p>
              </div>
            </div>
          ) : (
            siteEmployees.map((item, idx) => {
              const { start, end, meta } = startEndOf(item.shift);
              const timeIn = to12h(item?.attendance?.time_in);
              const timeOut = to12h(item?.attendance?.time_out);
              const eff = getEffectiveTime(
                item?.attendance?.time_in,
                item?.attendance?.time_out
              );
              const completed = !!(
                item?.attendance?.time_in && item?.attendance?.time_out
              );

              return (
                <div className="flex flex-col gap-4" key={item.id ?? idx}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-medium text-[#181D26]">
                        {formatHumanDate(item.date)}
                      </h4>
                      <p className="text-xs text-[#98A1B3]">
                        {start} – {end}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs ${
                        meta.isDay ? "text-[#F3C511]" : "text-[#33569F]"
                      }`}
                    >
                      {meta.isDay ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M4.51 3.23L3.31 2.03l-.94.94 1.19 1.19 1.94-1.93zM2.67 7H.67v1.33h2V7zM8.67.37H7.33v2h1.33v-2zM13.63 2.97l-.94-.94-1.19 1.19 1.19 1.19 1.94-1.93zM11.49 12.11l1.19 1.2.94-.94-1.2-1.19-.93.93zM13.33 7v1.33h2V7h-2zM8 3.67A4 4 0 1 0 12 7.67 4 4 0 0 0 8 3.67zM7.33 14.97h1.33v-1.97H7.33v1.97zM2.37 12.36l.94.94 1.19-1.2-.94-.94-1.19 1.2z"
                            fill="#F3C511"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M9.796 3.018c.157-.414-.21-.846-.653-.781-3.22.467-5.525 3.541-4.865 6.93.455 2.345 2.385 4.206 4.748 4.59 2.181.356 4.176-.507 5.436-2.006.28-.333.111-.864-.321-.945-3.512-.671-5.647-4.399-4.345-7.788z"
                            fill="#33569F"
                          />
                        </svg>
                      )}
                      <span className="text-[#181D26] text-xs font-normal">
                        {meta.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-[#98A1B3] text-xs font-normal">
                          Check in
                        </p>
                        <p className="text-[#181D26]">{timeIn}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[#98A1B3] text-xs font-normal">
                          Check out
                        </p>
                        <p className="text-[#181D26]">{timeOut}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#98A1B3] text-xs font-normal">
                        Effective hours
                      </p>
                      <p className="text-[#181D26]">{eff}</p>
                    </div>
                  </div>

                  <div
                    className={`w-fit px-4 py-1.5 ${
                      completed
                        ? "bg-[rgba(59,182,120,0.16)]"
                        : "bg-[rgba(255,126,106,0.16)]"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        completed ? "text-[#3BB678]" : "text-[#FF7E6A]"
                      }`}
                    >
                      {completed ? "Completed" : "Missing"}
                    </p>
                  </div>

                  {idx !== siteEmployees.length - 1 && (
                    <div className="w-full h-[1px] bg-[#98A1B3]/50" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Attendance;

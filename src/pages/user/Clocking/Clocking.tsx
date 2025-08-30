import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Site } from '../../../types/site';
import attendanceService from '../../../services/attendanceService';
import siteService from '../../../services/siteService';
import attendanceSettingService from '../../../services/attendanceSettingService';
import { SiteEmployee } from '../../../types/siteEmployee';
import siteEmployeeService from '../../../services/siteEmployeeService';
import Swal from "sweetalert2";
import { Attendance } from '../../../types/attendance';

type Settings = { label: string; placeholder: string; value: string };
type ShiftApi = "day" | "night" | "relief day" | "relief night";

const swalBase = {
    background: "#1e1e1e",
    color: "#f4f4f4",
    confirmButtonColor: "#EFBF04",
} as const;


const sgTodayISO = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

const addDaysInSG = (iso: string, days: number) => {
    // Pastikan manipulasi hari aman di zona SG
    const d = new Date(`${iso}T00:00:00+08:00`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};
const sgYesterdayISO = () => addDaysInSG(sgTodayISO(), -1);

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
const getSettingFrom = (settings: Settings[], label: string) =>
    settings.find(
        (s) => s.label.trim().toLowerCase() === label.trim().toLowerCase()
    )?.value ?? null;

const timeToMin = (hhmm?: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};


const getShiftStartEndMinFrom = (settings: Settings[], shift: ShiftApi) => {
    if (shift === "day") {
        return {
            start: timeToMin(getSettingFrom(settings, "Day shift start time")),
            end: timeToMin(getSettingFrom(settings, "Day shift end time")),
        };
    }
    if (shift === "night") {
        return {
            start: timeToMin(getSettingFrom(settings, "Night shift start time")),
            end: timeToMin(getSettingFrom(settings, "Night shift end time")),
        };
    }
    if (shift === "relief day") {
        return {
            start: timeToMin(getSettingFrom(settings, "RELIEF Day shift start time")),
            end: timeToMin(getSettingFrom(settings, "RELIEF Day shift end time")),
        };
    }
    // relief night
    return {
        start: timeToMin(getSettingFrom(settings, "RELIEF night shift start time")),
        end: timeToMin(getSettingFrom(settings, "RELIEF night shift end time")),
    };
};

const crossesMidnightFrom = (settings: Settings[], shift: ShiftApi) => {
    const { start, end } = getShiftStartEndMinFrom(settings, shift);
    return start != null && end != null && start > end;
};

// Tanggal efektif (tanggal start-shift) buat query attendance
const computeActiveAttendanceDateISOFrom = (
    settings: Settings[],
    shift: ShiftApi
) => {
    const { start, end } = getShiftStartEndMinFrom(settings, shift);
    if (start == null || end == null) return sgTodayISO();
    const now = nowMinutesInSG();
    if (!crossesMidnightFrom(settings, shift)) return sgTodayISO();
    // masih di paruh pagi (sebelum jam end) => pakai kemarin
    return now < end ? sgYesterdayISO() : sgTodayISO();
};

// Variasi label shift agar tahan terhadap inkonsistensi DB
const shiftVariants = (s: ShiftApi) =>
    [s, s.replace(" ", "-"), s.replace(" ", "_")] as const;

// Cari attendance dengan variasi tanggal & label
const findAttendance = async (
    token: string,
    siteId: string,
    userId: string,
    shift: ShiftApi,
    settings: Settings[]
) => {
    const mainDate = computeActiveAttendanceDateISOFrom(settings, shift);
    const altDate = mainDate === sgTodayISO() ? sgYesterdayISO() : sgTodayISO();
    const dates = Array.from(new Set([mainDate, altDate]));

    for (const date of dates) {
        for (const sh of shiftVariants(shift)) {
            try {
                const res = await attendanceService.getAttendanceBySiteUserShift(
                    token,
                    { site_id: siteId, user_id: userId, shift: sh as any, date }
                );
                if (res?.success && res?.data?.time_in) {
                    return { res, date, shiftSent: sh };
                }
            } catch {

            }
        }
    }
    return null;
};
const ClockingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Sites');
    const token = useSelector((state: RootState) => state.token.token);
    const user = useSelector((state: RootState) => state.user.user);
    const { idSite } = useParams<{ idSite: string }>();
    const [site, setSite] = useState<Site>();
    const [attendance, setAttendance] = useState<Attendance>();
    const [routes, setRoutes] = useState<any[]>([]);
    const [settings, setSettings] = useState<Settings[]>([]);
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const historyData = [
        {
            id: 1,
            title: "Condominium",
            date: "14 May 2025, Friday, 11:45AM",
            clockingPoint: "New Point One - 1 Top floor",
            clockingLocation: "Basement Tower",
            remark: "Normal",
        },
        {
            id: 2,
            title: "Condominium",
            date: "14 May 2025, Friday, 11:45AM",
            clockingPoint: "New Point One - 1 Top floor",
            clockingLocation: "Basement Tower",
            remark: "Normal",
        }
    ];
    const fetchSite = async () => {
        console.log("fecthsite")
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

    const fetchAttendance = async () => {
        if (!token || !idSite || !user?.id) return;

        try {

            let shift: ShiftApi | null = null;
            const date = new Date().toISOString().split("T")[0];

            const res = await attendanceService.getAttendanceBySiteUserShift(token, {
                site_id: idSite,
                user_id: user.id,
                shift,
                date,
            });

            console.log("Attendance result:", res);

            if (res?.success && res?.data) {
                setAttendance(res.data);
            } else {
                setAttendance(undefined);
            }
        } catch (err) {
            console.error("Fetch attendance error:", err);
            setAttendance(undefined);
        }
    };

    const fetchSettings = async (): Promise<Settings[]> => {
        if (!token) return [];
        try {
            const res = await attendanceSettingService.getAttendanceSetting(token);
            if (res?.success) {
                const d = res.data;
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
                setSettings(mapped);
                return mapped;
            }
        } catch (e: any) {
            console.error(e?.message || e);
        }
        return [];
    };

    // ---- Gating logic
    useEffect(() => {
        (async () => {
            if (!token || !user?.id || !idSite) return;
            setLoading(true);
            setAllowed(null);

            try {
                // Pastikan settings siap dan kita punya list lokal untuk perhitungan di efek ini
                const sList = settings.length > 0 ? settings : await fetchSettings();
                if (sList.length === 0) {
                    // Tanpa settings, tidak bisa hitung window -> kunci
                    setAllowed(false);
                    await Swal.fire({
                        ...swalBase,
                        icon: "info",
                        title: "Guard Tour Locked",
                        text: "Attendance settings not available. Please contact admin.",
                    });
                    navigate(-1);
                    setLoading(false);
                    return;
                }

                // 1) Coba pakai site_employee milik user di site ini
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
                    console.warn("[Clocking] getNearestSiteUser error:", e);
                }

                if (seData && seSiteId === String(idSite) && seShift) {
                    const found = await findAttendance(
                        token,
                        String(idSite),
                        user.id,
                        seShift,
                        sList
                    );
                    console.log("[Clocking] employed attendance", found);

                    if (found && !found.res?.data?.time_out) {
                        setAllowed(true);
                        setAttendance(found.res.data.date);
                        setLoading(false);
                        return;
                    }


                    setAllowed(false);
                    await Swal.fire({
                        ...swalBase,
                        icon: "info",
                        title: "Clocking Locked",
                        text: "Access is only available if you have checked in and have not yet checked out for your shift.",
                    });
                    navigate(-1);
                    setLoading(false);
                    return;
                }

                // 2) Jika tidak match, coba Relief window (day/night)
                const now = nowMinutesInSG();
                const rd = getShiftStartEndMinFrom(sList, "relief day");
                const rn = getShiftStartEndMinFrom(sList, "relief night");

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

                console.log("[Clocking] relief window", {
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

                const foundRelief = await findAttendance(
                    token,
                    String(idSite),
                    user.id,
                    reliefShift,
                    sList
                );
                console.log("[Clocking] relief attendance", foundRelief);

                if (foundRelief && !foundRelief.res?.data?.time_out) {
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
                console.error("[Clocking] gating error:", e);
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
        // Depend hanya pada token/user/idSite/settings.length agar efek rerun
    }, [token, user?.id, idSite, settings.length, navigate]);

    useEffect(() => {
        fetchSite();
        fetchAttendance();
    }, [token, idSite]);


    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 pt-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Clocking</h1>
            </div>

            <div className="flex border-b border-gray-700">
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'Sites'
                        ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]'
                        : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('Sites')}
                >
                    Sites
                </button>
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'History'
                        ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]'
                        : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('History')}
                >
                    History
                </button>
            </div>

            {activeTab === 'Sites' && (
                <div className="flex flex-col items-start w-full">
                    {site   ? (
                        <button
                            onClick={() =>
                                navigate(`/user/clocking/${site.id}/route-select`)
                            }
                            className="flex justify-between items-center w-full p-4 rounded-lg bg-transparent">
                            <div className="flex flex-col">
                                <p className="text-sm text-[#98A1B3]">{site.name}</p>
                                <p className="text-[#F4F7FF] text-base mt-1">
                                    {attendance?.date}
                                </p>
                            </div>
                            <ChevronRight className="text-[#F4F7FF]" />
                        </button>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="w-40 h-40 bg-[#D8D8D8]/40"></div>
                            <p className="mt-4 text-[#F4F7FF] font-noto">No data available</p>
                        </div>
                    )}
                </div>
            )}


            {activeTab === 'History' && (
                <div className="flex flex-col gap-4">
                    {historyData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#252C38] p-4 rounded-lg flex flex-col gap-4"
                        >
                            <p className="text-[#EFBF04] font-semibold">{item.title}</p>

                            <div className="text-sm text-[#98A1B3] gap-4 flex flex-col">
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Date & time</p>
                                    <p className="text-[#F4F7FF]">{item.date}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Clocking point</p>
                                    <p className="text-[#F4F7FF]">{item.clockingPoint}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Clocking location</p>
                                    <p className="text-[#F4F7FF]">{item.clockingLocation}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Remark</p>
                                    <p className="text-[#F4F7FF]">{item.remark}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClockingPage;

import { CheckCircle2, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../../store';

import { Attendance } from '../../../types/attendance';
import { Site } from '../../../types/site';
import { SiteEmployee } from '../../../types/siteEmployee';

import attendanceService from '../../../services/attendanceService';
import attendanceSettingService from '../../../services/attendanceSettingService';
import siteEmployeeService from '../../../services/siteEmployeeService';
import siteService from '../../../services/siteService';

import Swal from 'sweetalert2';

type Settings = { label: string; placeholder: string; value: string };
type ShiftApi = 'day' | 'night' | 'relief day' | 'relief night';

const swalBase = {
    background: '#1e1e1e',
    color: '#f4f4f4',
    confirmButtonColor: '#EFBF04',
} as const;

// ---------- Time helpers (Asia/Singapore) ----------
const sgTodayISO = () =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

const addDaysInSG = (iso: string, days: number) => {
    const d = new Date(`${iso}T00:00:00+08:00`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};
const sgYesterdayISO = () => addDaysInSG(sgTodayISO(), -1);

const nowMinutesInSG = () => {
    const parts = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    return hh * 60 + mm;
};

const inRangeClock = (nowMin: number, startMin: number, endMin: number) =>
    startMin <= endMin ? nowMin >= startMin && nowMin < endMin : nowMin >= startMin || nowMin < endMin;

// ---------- Shift & setting helpers ----------
const parseEmployeeShift = (raw: any): ShiftApi | null => {
    const s = String(raw ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
    if (s === 'day' || s === 'night' || s === 'relief day' || s === 'relief night') return s as ShiftApi;
    return null;
};

const getSettingFrom = (settings: Settings[], label: string) =>
    settings.find((s) => s.label.trim().toLowerCase() === label.trim().toLowerCase())?.value ?? null;

const timeToMin = (hhmm?: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

const getShiftStartEndMinFrom = (settings: Settings[], shift: ShiftApi) => {
    if (shift === 'day') {
        return {
            start: timeToMin(getSettingFrom(settings, 'Day shift start time')),
            end: timeToMin(getSettingFrom(settings, 'Day shift end time')),
        };
    }
    if (shift === 'night') {
        return {
            start: timeToMin(getSettingFrom(settings, 'Night shift start time')),
            end: timeToMin(getSettingFrom(settings, 'Night shift end time')),
        };
    }
    if (shift === 'relief day') {
        return {
            start: timeToMin(getSettingFrom(settings, 'RELIEF Day shift start time')),
            end: timeToMin(getSettingFrom(settings, 'RELIEF Day shift end time')),
        };
    }
    // relief night
    return {
        start: timeToMin(getSettingFrom(settings, 'RELIEF night shift start time')),
        end: timeToMin(getSettingFrom(settings, 'RELIEF night shift end time')),
    };
};

const crossesMidnightFrom = (settings: Settings[], shift: ShiftApi) => {
    const { start, end } = getShiftStartEndMinFrom(settings, shift);
    return start != null && end != null && start > end;
};

// Tanggal efektif (start shift date) untuk query attendance
const computeActiveAttendanceDateISOFrom = (settings: Settings[], shift: ShiftApi) => {
    const { start, end } = getShiftStartEndMinFrom(settings, shift);
    if (start == null || end == null) return sgTodayISO();
    const now = nowMinutesInSG();
    if (!crossesMidnightFrom(settings, shift)) return sgTodayISO();
    return now < end ? sgYesterdayISO() : sgTodayISO();
};

const shiftVariants = (s: ShiftApi) => [s, s.replace(' ', '-'), s.replace(' ', '_')] as const;

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
                const res = await attendanceService.getAttendanceBySiteUserShift(token, {
                    site_id: siteId,
                    user_id: userId,
                    shift: sh as any,
                    date,
                });
                if (res?.success && res?.data?.time_in) {
                    return { res, date, shiftSent: sh };
                }
            } catch {
                // ignore & continue
            }
        }
    }
    return null;
};

// ---------- Route list helpers for UI ----------
type RouteStatus = 'done' | 'skipped' | 'pending';

const getRouteStatus = (r: any): RouteStatus => {
    const raw = String(r.status ?? r.progress ?? '').toLowerCase();
    if (['done', 'completed', 'complete', 'success', 'finished', 'checked'].includes(raw)) return 'done';
    if (['skipped', 'skip'].includes(raw)) return 'skipped';
    return 'pending';
};

const routeCardClasses = (status: RouteStatus) => {
    switch (status) {
        case "done":
            return "border-emerald-[#222834]/60 bg-emerald-[#222834]/10";
        case "skipped":
            return "border-amber-[#222834]/60 bg-amber-[#222834]/10";
        default:
            return "border-transparent bg-[#222834]/60 hover:bg-[#222834]/10";
    }
};

// Ubah path ini sesuai kebutuhan (mis. ke halaman scan NFC)
const toRouteDetail = (siteId: string | undefined, r: any) => `/user/clocking/${siteId}/route/${r.id}`;

// =========================================================

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
            title: 'Condominium',
            date: '14 May 2025, Friday, 11:45AM',
            clockingPoint: 'New Point One - 1 Top floor',
            clockingLocation: 'Basement Tower',
            remark: 'Normal',
        },
        {
            id: 2,
            title: 'Condominium',
            date: '14 May 2025, Friday, 11:45AM',
            clockingPoint: 'New Point One - 1 Top floor',
            clockingLocation: 'Basement Tower',
            remark: 'Normal',
        },
    ];

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

    const fetchAttendance = async () => {
        if (!token || !idSite || !user?.id) return;
        try {
            let shift: ShiftApi | null = null;
            const date = new Date().toISOString().split('T')[0];
            const res = await attendanceService.getAttendanceBySiteUserShift(token, {
                site_id: idSite,
                user_id: user.id,
                shift,
                date,
            });
            if (res?.success && res?.data) setAttendance(res.data);
            else setAttendance(undefined);
        } catch (err) {
            console.error('Fetch attendance error:', err);
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
                    { label: 'Grace period (in minutes)', placeholder: '', value: String(d.grace_period) },
                    { label: 'Geo fencing (in meters)', placeholder: '', value: String(d.geo_fencing) },
                    { label: 'Day shift start time', placeholder: '00:00', value: d.day_shift_start_time.slice(0, 5) },
                    { label: 'Day shift end time', placeholder: '00:00', value: d.day_shift_end_time.slice(0, 5) },
                    { label: 'Night shift start time', placeholder: '00:00', value: d.night_shift_start_time.slice(0, 5) },
                    { label: 'Night shift end time', placeholder: '00:00', value: d.night_shift_end_time.slice(0, 5) },
                    { label: 'RELIEF Day shift start time', placeholder: '00:00', value: d.relief_day_shift_start_time.slice(0, 5) },
                    { label: 'RELIEF Day shift end time', placeholder: '00:00', value: d.relief_day_shift_end_time.slice(0, 5) },
                    { label: 'RELIEF night shift start time', placeholder: '00:00', value: d.relief_night_shift_start_time.slice(0, 5) },
                    { label: 'RELIEF night shift end time', placeholder: '00:00', value: d.relief_night_shift_end_time.slice(0, 5) },
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
                const sList = settings.length > 0 ? settings : await fetchSettings();
                if (sList.length === 0) {
                    setAllowed(false);
                    await Swal.fire({
                        ...swalBase,
                        icon: 'info',
                        title: 'Guard Tour Locked',
                        text: 'Attendance settings not available. Please contact admin.',
                    });
                    navigate(-1);
                    setLoading(false);
                    return;
                }

                // 1) Cek site_employee user di site ini
                let seData: SiteEmployee | undefined;
                let seShift: ShiftApi | null = null;
                let seSiteId: string | null = null;
                try {
                    const seRes = await siteEmployeeService.getNearestSiteUser(token, user);
                    if (seRes?.success && seRes?.data) {
                        seData = seRes.data;
                        seShift =
                            parseEmployeeShift(seRes.data?.shift) ||
                            parseEmployeeShift(seRes.data?.site_employee?.shift) ||
                            parseEmployeeShift(seRes.data?.siteEmployee?.shift);
                        seSiteId = String(seRes.data?.site?.id ?? '');
                    }
                } catch (e) {
                    console.warn('[Clocking] getNearestSiteUser error:', e);
                }

                if (seData && seSiteId === String(idSite) && seShift) {
                    const found = await findAttendance(token, String(idSite), user.id, seShift, sList);
                    if (found && !found.res?.data?.time_out) {
                        setAllowed(true);
                        setAttendance(found.res.data); // <- simpan objek attendance yang valid
                        setLoading(false);
                        return;
                    }

                    setAllowed(false);
                    await Swal.fire({
                        ...swalBase,
                        icon: 'info',
                        title: 'Clocking Locked',
                        text: 'Access is only available if you have checked in and have not yet checked out for your shift.',
                    });
                    navigate(-1);
                    setLoading(false);
                    return;
                }

                // 2) Cek relief window
                const now = nowMinutesInSG();
                const rd = getShiftStartEndMinFrom(sList, 'relief day');
                const rn = getShiftStartEndMinFrom(sList, 'relief night');

                let reliefShift: ShiftApi | null = null;
                if (rd.start != null && rd.end != null && inRangeClock(now, rd.start, rd.end)) {
                    reliefShift = 'relief day';
                } else if (rn.start != null && rn.end != null && inRangeClock(now, rn.start, rn.end)) {
                    reliefShift = 'relief night';
                }

                if (!reliefShift) {
                    setAllowed(false);
                    await Swal.fire({
                        ...swalBase,
                        icon: 'info',
                        title: 'Outside Relief Hours',
                        text: 'Guard Tour is available when a Relief shift is active and you have already checked in.',
                    });
                    navigate(-1);
                    setLoading(false);
                    return;
                }

                const foundRelief = await findAttendance(token, String(idSite), user.id, reliefShift, sList);
                if (foundRelief && !foundRelief.res?.data?.time_out) {
                    setAllowed(true);
                    setLoading(false);
                    return;
                }

                setAllowed(false);
                await Swal.fire({
                    ...swalBase,
                    icon: 'info',
                    title: 'Guard Tour Locked',
                    text: 'Access is only available if you have checked in and have not yet checked out for your shift.',
                });
                navigate(-1);
            } catch (e) {
                console.error('[Clocking] gating error:', e);
                setAllowed(false);
                await Swal.fire({
                    ...swalBase,
                    icon: 'info',
                    title: 'Guard Tour Locked',
                    text: 'Access is only available if you have checked in and have not yet checked out for your shift.',
                });
                navigate(-1);
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?.id, idSite, settings.length, navigate]);

    useEffect(() => {
        fetchSite();
        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, idSite]);

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 pt-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Clocking</h1>
            </div>

            <div className="flex border-b border-gray-700">
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'Sites' ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]' : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('Sites')}
                >
                    Sites
                </button>
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'History' ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]' : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('History')}
                >
                    History
                </button>
            </div>

            {/* SITES -> tampilkan ROUTES */}
            {activeTab.toLowerCase() === 'sites' && (
                <div className="flex flex-col gap-3 w-full">
                    {routes.length ? (
                        routes.map((r, i) => {
                            const status = getRouteStatus(r);
                            return (
                                <button
                                    key={r.id ?? i}
                                    onClick={() => navigate(toRouteDetail(site?.id, r))}
                                    className={`group rounded-xl border px-4 py-3 text-left transition ${routeCardClasses(
                                        status
                                    )} focus:outline-none focus:ring-2 focus:ring-[#EFBF04]/60`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            {`Point ${r.order ?? i + 1} : ${r.name}`}
                                            {status === 'skipped' && <span className="text-amber-300 ml-1">(Skipped)</span>}
                                        </p>

                                        {status === 'done' ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        ) : status === 'skipped' ? (
                                            <Minus className="h-5 w-5 text-amber-400" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 py-10">
                            <div className="w-40 h-40 bg-[#D8D8D8]/40" />
                            <p className="mt-4 text-[#F4F7FF] font-noto">No routes available</p>
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY */}
            {activeTab === 'History' && (
                <div className="flex flex-col gap-4">
                    {historyData.map((item) => (
                        <div key={item.id} className="bg-[#252C38] p-4 rounded-lg flex flex-col gap-4">
                            <p className="text-[#EFBF04] font-semibold">{item.title}</p>

                            <div className="text-sm text-[#98A1B3] gap-4 flex flex-col">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs">Date & time</p>
                                    <p className="text-[#F4F7FF]">{item.date}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs">Clocking point</p>
                                    <p className="text-[#F4F7FF]">{item.clockingPoint}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs">Clocking location</p>
                                    <p className="text-[#F4F7FF]">{item.clockingLocation}</p>
                                </div>
                                <div className="flex flex-col gap-1">
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

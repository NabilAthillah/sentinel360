import { CheckCircle2, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import guardTourService from "../../../services/guardTourService";
import siteService from "../../../services/siteService";
import { RootState } from "../../../store";
import { Site } from "../../../types/site";

type Status = "done" | "skipped" | "pending";

type Pointer = {
    id: string;
    name: string;
    order?: number | string;
    nfc_tag?: string;
    remarks?: string | null;
};

type RouteItem = {
    id: string;
    name: string;
    order?: number;
    route?: number[] | string | string[];
    pointers?: Pointer[];
    progress?: string;
    status?: string;
};

type GuardTourRow = {
    id?: string;
    pointer_id: string;
    status?: string;
    reason?: string | null;
    updated_at?: string;
};

function parseSequenceTokens(seq: unknown): string[] {
    if (seq == null) return [];
    if (Array.isArray(seq)) return seq.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof seq === "string") {
        const cleaned = seq.replace(/[\[\]\(\)\s]/g, "");
        if (!cleaned) return [];
        return cleaned.split(/[^A-Za-z0-9_-]+/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

const toNum = (n: unknown) => (Number.isFinite(Number(n)) ? Number(n) : Number.NaN);

function normalizeGuardStatus(s?: string): Status {
    const val = String(s ?? "").toLowerCase();
    if (["done", "completed", "complete", "success", "finished", "checked", "scanned"].includes(val)) return "done";
    if (["skipped", "skip"].includes(val)) return "skipped";
    return "pending";
}

const RouteSelect = () => {
    const navigate = useNavigate();
    const { idSite, idRoute } = useParams<{ idSite: string; idRoute?: string }>();

    const token = useSelector((s: RootState) => s.token.token);
    const [site, setSite] = useState<Site>();
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [loadingStatus, setLoadingStatus] = useState(false);

    // Simple toast
    const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
    const showToast = (msg: string) => {
        setToast({ open: true, msg });
        setTimeout(() => setToast({ open: false, msg: "" }), 2200);
    };

    // Fetch site + routes
    useEffect(() => {
        const fetchSite = async () => {
            if (!token || !idSite) return;
            try {
                const res = await siteService.getSiteById(idSite, token);
                if (res?.success) {
                    const s = (res.data?.site ?? res.data) as Site & { routes?: RouteItem[] };
                    setSite(s);
                    setRoutes(s?.routes ?? []);
                }
            } catch (e: any) {
                console.error(e?.message || e);
            }
        };
        fetchSite();
    }, [token, idSite]);

    const toRouteDetail = (r: RouteItem) => `/sites/${idSite}/routes/${r.id}`;
    const toPointerDetail = (routeId: string | undefined, p: Pointer) =>
        `/user/clocking/${idSite}/route/${routeId}/point/${p.id}/scan`;

    const pointerRoute = useMemo(() => {
        if (!routes?.length) return undefined;
        if (idRoute) return routes.find((r) => String(r.id) === String(idRoute));
        if (routes.length === 1) return routes[0];
        return undefined;
    }, [routes, idRoute]);

    // Ambil status guard tour (hari ini) untuk route aktif
    useEffect(() => {
        const fetchStatuses = async () => {
            if (!token || !idSite || !pointerRoute?.id) return;
            setLoadingStatus(true);
            try {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const dd = String(today.getDate()).padStart(2, "0");
                const date = `${yyyy}-${mm}-${dd}`;

                const resp = await guardTourService.index(token, {
                    site_id: idSite,
                    route_id: pointerRoute.id,
                    date,
                });

                const rows: GuardTourRow[] =
                    resp?.data?.items ??
                    resp?.data?.guard_tours ??
                    resp?.data ??
                    resp?.items ??
                    resp ??
                    [];

                const map: Record<string, { status: Status; ts: number }> = {};
                for (const row of rows as GuardTourRow[]) {
                    const ptr = row.pointer_id;
                    if (!ptr) continue;
                    const st = normalizeGuardStatus(row.status);
                    const ts = row.updated_at ? Date.parse(row.updated_at) : 0;
                    const prev = map[ptr];
                    if (!prev || ts >= prev.ts) {
                        map[ptr] = { status: st, ts };
                    }
                }

                const finalMap: Record<string, Status> = {};
                Object.keys(map).forEach((k) => (finalMap[k] = map[k].status));
                setStatusMap(finalMap);
            } catch (e: any) {
                console.error(e?.message || e);
                setStatusMap({});
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchStatuses();
    }, [token, idSite, pointerRoute?.id]);

    // Ambil ORDER dari kolom route (hanya numerik)
    const orderTokens = useMemo(() => {
        const tokens = parseSequenceTokens(pointerRoute?.route);
        return tokens
            .map((t) => {
                const n = parseInt(t, 10);
                return Number.isFinite(n) ? String(n) : null;
            })
            .filter((x): x is string => Boolean(x));
    }, [pointerRoute?.route]);

    // Tampilkan HANYA pointers yang disebut di route
    const pointers: Pointer[] = useMemo(() => {
        const list: Pointer[] = Array.isArray(pointerRoute?.pointers) ? pointerRoute!.pointers : [];
        if (!list.length) return [];

        if (orderTokens.length) {
            const allowed = new Set(orderTokens);
            const filtered = list.filter((p) => {
                const n = toNum(p.order);
                if (!Number.isFinite(n)) return false;
                return allowed.has(String(n));
            });

            const indexByOrder = new Map<string, number>();
            orderTokens.forEach((tok, i) => indexByOrder.set(tok, i));

            return filtered.sort((a, b) => {
                const ao = String(toNum(a.order));
                const bo = String(toNum(b.order));
                const ia = indexByOrder.get(ao) ?? Number.POSITIVE_INFINITY;
                const ib = indexByOrder.get(bo) ?? Number.POSITIVE_INFINITY;
                if (ia !== ib) return ia - ib;

                const an = toNum(a.order);
                const bn = toNum(b.order);
                if (an !== bn) return an - bn;

                return String(a.name ?? "").localeCompare(String(b.name ?? ""));
            });
        }

        // jika route kosong: semua (urut by order)
        return [...list].sort((a, b) => {
            const an = toNum(a.order);
            const bn = toNum(b.order);
            const aOrd = Number.isFinite(an) ? an : Number.POSITIVE_INFINITY;
            const bOrd = Number.isFinite(bn) ? bn : Number.POSITIVE_INFINITY;
            if (aOrd !== bOrd) return aOrd - bOrd;
            return String(a.name ?? "").localeCompare(String(b.name ?? ""));
        });
    }, [pointerRoute, orderTokens]);

    const showPointers = Boolean(pointerRoute);

    // status pointer dari table guard tour
    const getStatusPointer = (p: Pointer): Status => statusMap[p.id] ?? "pending";

    const cardClasses = (status: Status, disabled: boolean) => {
        const base =
            status === "done"
                ? "border-green-500/60 bg-green-500/20"
                : status === "skipped"
                    ? "border-amber-400/60 bg-amber-400/10"
                    : "border-transparent bg-[#222834]/60 hover:bg-[#222834]/10";
        const disabledCls = disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer";
        return `group rounded-xl border px-4 py-3 transition ${base} ${disabledCls} focus:outline-none focus:ring-2 focus:ring-[#EFBF04]/60`;
    };

    const handlePointerClick = (p: Pointer, status: Status) => {
        if (status === "done") {
            showToast("Point sudah selesai.");
            return;
        }
        navigate(toPointerDetail(pointerRoute?.id, p));
    };

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 pt-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <button onClick={() => navigate(-1)}>
                    <ChevronLeft className="text-[#F4F7FF]" />
                </button>
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">
                    {showPointers ? pointerRoute?.name ?? "Pointers" : site?.name ?? "Routes"}
                </h1>
            </div>

            <div className="flex-1">
                {/* === POINTERS MODE === */}
                {showPointers ? (
                    pointers.length ? (
                        <div className="flex flex-col gap-4">
                            {pointers.map((p, i) => {
                                const status = getStatusPointer(p);
                                const disabled = status === "done";
                                const ordNum = toNum(p.order);
                                const labelIndex = Number.isFinite(ordNum) ? ordNum : i + 1;

                                return (
                                    <div
                                        key={p.id ?? i}
                                        role="button"
                                        tabIndex={disabled ? -1 : 0}
                                        aria-disabled={disabled}
                                        aria-label={`Open ${p.name}`}
                                        onClick={() => handlePointerClick(p, status)}
                                        onKeyDown={(e) => {
                                            if (disabled) return;
                                            if (e.key === "Enter" || e.key === " ") handlePointerClick(p, status);
                                        }}
                                        className={cardClasses(status, disabled)}
                                        title={disabled ? "Point sudah selesai" : undefined}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {`Point ${labelIndex} : ${p.name}`}
                                                    {status === "skipped" && <span className="text-amber-300 ml-1">(Skipped)</span>}
                                                    {status === "done" && <span className="text-green-300 ml-1">(Done)</span>}
                                                    {loadingStatus && <span className="text-slate-400 ml-2 text-xs">loading…</span>}
                                                </p>
                                            </div>

                                            {status === "done" ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                            ) : status === "skipped" ? (
                                                <Minus className="h-5 w-5 text-amber-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[#98A1B3]">No pointers available</p>
                    )
                ) : // === ROUTES MODE ===
                    routes.length ? (
                        <div className="flex flex-col gap-4">
                            {routes.map((route, i) => {
                                const routeStatus = normalizeGuardStatus((route as any)?.status);
                                return (
                                    <div
                                        key={route.id ?? i}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Open ${route.name}`}
                                        onClick={() => navigate(toRouteDetail(route))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") navigate(toRouteDetail(route));
                                        }}
                                        className={`group rounded-xl border px-4 py-3 transition cursor-pointer ${routeStatus === "done"
                                                ? "border-green-500/60 bg-green-500/20"
                                                : routeStatus === "skipped"
                                                    ? "border-amber-400/60 bg-amber-400/10"
                                                    : "border-transparent bg-[#222834]/60 hover:bg-[#222834]/10"
                                            } focus:outline-none focus:ring-2 focus:ring-[#EFBF04]/60`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">
                                                {`Route ${route.order ?? i + 1} : ${route.name}`}
                                                {routeStatus === "skipped" && <span className="text-amber-300 ml-1">(Skipped)</span>}
                                                {routeStatus === "done" && <span className="text-emerald-300 ml-1">(Done)</span>}
                                            </p>

                                            {routeStatus === "done" ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            ) : routeStatus === "skipped" ? (
                                                <Minus className="h-5 w-5 text-amber-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[#98A1B3]">No routes available</p>
                    )}
            </div>

            {/* Toast */}
            {toast.open && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1E27] border border-[#2b3342] text-white rounded-full px-4 py-2 shadow-lg">
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default RouteSelect;

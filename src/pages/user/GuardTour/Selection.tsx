import { CheckCircle2, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Loader from "../../../components/Loader";
import guardTourService from "../../../services/guardTourService";
import routeService from "../../../services/routeService";
import { RootState } from "../../../store";
import { Pointer } from "../../../types/pointer";

type Status = "done" | "skipped" | "pending";

type RoutePayload = {
  id: string;
  name: string;
  route?: number[] | string | string[];
  pointers?: Pointer[];
};

type GuardTourRow = {
  pointer_id: string;
  status?: string;
  reason?: string | null;
  updated_at?: string;
};

// ===== Helpers =====
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

const Selection = () => {
  const navigate = useNavigate();
  const { idSite, idRoute } = useParams<{ idSite: string; idRoute: string }>();
  const token = useSelector((state: RootState) => state.token.token);

  const [routeData, setRouteData] = useState<RoutePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  // mini toast
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
  const showToast = (msg: string) => {
    setToast({ open: true, msg });
    setTimeout(() => setToast({ open: false, msg: "" }), 2200);
  };

  // Fetch route detail (route + pointers)
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      try {
        const res = await routeService.getRouteById(token, idRoute);
        const payload = (res?.data?.data ?? res?.data) as RoutePayload;
        setRouteData(payload ?? null);
      } catch (err) {
        console.error("Error fetching route:", err);
        setRouteData(null);
      } finally {
        setLoading(false);
      }
    };
    if (token && idRoute) fetchRoute();
  }, [token, idRoute]);

  // Fetch guard tour statuses (today) for this route
  useEffect(() => {
    const fetchStatuses = async () => {
      if (!token || !idSite || !routeData?.id) return;
      setLoadingStatus(true);
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const date = `${yyyy}-${mm}-${dd}`;

        const resp = await guardTourService.index(token, {
          site_id: idSite,
          route_id: routeData.id,
          date,
        });

        const rows: GuardTourRow[] =
          resp?.data?.items ??
          resp?.data?.guard_tours ??
          resp?.data ??
          resp?.items ??
          resp ??
          [];

        // ambil status terbaru per pointer
        const temp: Record<string, { status: Status; ts: number }> = {};
        for (const row of rows) {
          const pid = row.pointer_id;
          if (!pid) continue;
          const st = normalizeGuardStatus(row.status);
          const ts = row.updated_at ? Date.parse(row.updated_at) : 0;
          const prev = temp[pid];
          if (!prev || ts >= prev.ts) temp[pid] = { status: st, ts };
        }

        const finalMap: Record<string, Status> = {};
        Object.keys(temp).forEach((k) => (finalMap[k] = temp[k].status));
        setStatusMap(finalMap);
      } catch (e) {
        console.error(e);
        setStatusMap({});
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatuses();
  }, [token, idSite, routeData?.id]);

  // Ambil urutan dari kolom "route"
  const orderTokens = useMemo(() => {
    const tokens = parseSequenceTokens(routeData?.route);
    return tokens
      .map((t) => {
        const n = parseInt(t, 10);
        return Number.isFinite(n) ? String(n) : null;
      })
      .filter((x): x is string => Boolean(x));
  }, [routeData?.route]);

  // Filter + urutkan pointers sesuai route (jika ada)
  const pointers: Pointer[] = useMemo(() => {
    const list = Array.isArray(routeData?.pointers) ? routeData!.pointers : [];
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

    // fallback: urut by order naik
    return [...list].sort((a, b) => {
      const an = toNum(a.order);
      const bn = toNum(b.order);
      const aOrd = Number.isFinite(an) ? an : Number.POSITIVE_INFINITY;
      const bOrd = Number.isFinite(bn) ? bn : Number.POSITIVE_INFINITY;
      if (aOrd !== bOrd) return aOrd - bOrd;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""));
    });
  }, [routeData, orderTokens]);

  // ambil status pointer dari map
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

  const toPointerDetail = (p: Pointer) =>
    `/user/guard-tours/${idSite}/route/${idRoute}/point/${p.id}/scan`;

  const handlePointerClick = (p: Pointer, status: Status) => {
    if (status === "done") {
      showToast("Point sudah selesai.");
      return;
    }
    navigate(toPointerDetail(p));
  };

  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 pt-20">
      {/* Header */}
      <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="text-[#F4F7FF]" />
        </button>
        <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">
          {routeData?.name ?? "Pointers"}
        </h1>
      </div>

      <div className="flex-1">
        {loading ? (
          <Loader primary />
        ) : pointers.length ? (
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
                    <p className="text-sm font-medium">
                      {`Point ${labelIndex} : ${p.name}`}
                      {status === "skipped" && <span className="text-amber-300 ml-1">(Skipped)</span>}
                      {status === "done" && <span className="text-green-300 ml-1">(Done)</span>}
                      {loadingStatus && <span className="text-slate-400 ml-2 text-xs">loading…</span>}
                    </p>

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

export default Selection;

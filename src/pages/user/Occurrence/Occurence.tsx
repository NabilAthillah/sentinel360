import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../components/Loader";
import occurrenceCatgService from "../../../services/occurrenceCatgService";
import occurrenceService from "../../../services/occurrenceService";
import siteService from "../../../services/siteService";
import { Site } from "../../../types/site";

type Occurrence = {
    id: string;
    occurred_at?: string;
    date?: string;
    time?: string;
    detail?: string;
    site?: { id: string; name: string };
    category?: { id: string; name: string; status?: string };
};

const Occurence = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
    const [nearestSite , setNearestSite] =useState<Site[]>([]);
    const { idSite } = useParams<{ idSite: string }>();
    const swalOpt = {
        background: "#1e1e1e",
        color: "#f4f4f4",
        confirmButtonColor: "#EFBF04",
        customClass: { popup: "swal2-dark-popup" },
    } as const;

    const tokenGuard = () => {
        const token = localStorage.getItem("token");
        if (!token || !idSite ) {
            localStorage.clear();
            Swal.fire({
                icon: "error",
                title: "Session expired",
                text: "Please login to continue.",
                ...swalOpt,
            }).then(() => navigate("/auth/login"));
            return null;
        }
        return token;
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = tokenGuard();
            if (!token) return;
            await Promise.allSettled([
                siteService.getAllSite(token),
                occurrenceCatgService.getCategories(token),
            ]);
            const res = await occurrenceService.getAllOccurrence(token);
            if (res?.data) {
                const data = res.data.filter((o: Occurrence) => o.category?.status === "active");
                setOccurrences(data);
            }
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to load data.", ...swalOpt });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const headerTitle = useMemo(() => occurrences[0]?.site?.name || "e-Occurrence", [occurrences]);

    const formatDT = (o: Occurrence) => {
        let iso = o.occurred_at;
        if (!iso && o.date && o.time) {
            const t = o.time.length === 5 ? `${o.time}:00` : o.time;
            iso = `${o.date}T${t}`;
        }
        if (!iso) return "Unknown";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "Unknown";
        const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(d);
        const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(d);
        const time = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
        return `${date}, ${weekday}, ${time}`;
    };

    const onDelete = async (id: string) => {
        const ask = await Swal.fire({
            icon: "warning",
            title: "Delete?",
            text: "This action cannot be undone.",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            ...swalOpt,
        });
        if (!ask.isConfirmed) return;
        try {
            const token = tokenGuard();
            if (!token) return;
            if (typeof (occurrenceService as any).deleteOccurrence === "function") {
                await (occurrenceService as any).deleteOccurrence(token, id);
            }
            setOccurrences((s) => s.filter((x) => x.id !== id));
            Swal.fire({ icon: "success", title: "Deleted", text: "Occurrence removed.", ...swalOpt });
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to delete.", ...swalOpt });
        }
    };

    return (
        <div className="min-h-screen bg-[#181D26] text-white flex flex-col pt-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">HDB</h1>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader primary />
                </div>
            ) : occurrences.length === 0 ? (
                <div className="flex flex-col flex-1 justify-center items-center w-full">
                    <img src="/images/Incident.png" alt="Incident" className="w-1/2" />
                </div>
            ) : (
                <div className="px-6 pt-4 flex flex-col gap-4 ">
                    {occurrences.map((o) => (
                        <div key={o.id} className="bg-[#222834] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#EFBF04] font-semibold capitalize">situation</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/user/e-occurence/report/edit/${o.id}`)}
                                        className="p-2 rounded-md hover:bg-white/5"
                                        aria-label="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(o.id)}
                                        className="p-2 rounded-md hover:bg-white/5"
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-xs text-[#98A1B3]">Date & time</p>
                                    <p className="text-sm">{formatDT(o)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#98A1B3]">Occurrence</p>
                                    <p className="text-sm">{o.category?.name || "Unknown"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-4 justify-center items-center px-6 w-full py-10">
                <Link
                    to="/user/e-occurence/history"
                    className="gap-3 w-full border py-3 border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center"
                >
                    <p>History</p>
                </Link>
                <Link
                    to="/user/e-occurence/report"
                    className="gap-3 w-full py-3 bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center"
                >
                    <p>Report</p>
                </Link>
            </div>
        </div>
    );
};

export default Occurence;

import { ArrowLeft, Loader2, Wifi } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import guardTourService from "../../../services/guardTourService";

type NDEFRecordLike = {
    recordType: string;
    mediaType?: string;
    encoding?: string;
    data: any; // DataView / ArrayBuffer / TypedArray
};

const ScanClocking = () => {
    const navigate = useNavigate();
    const { idSite, idRoute, idPoint } = useParams<{ idSite: string; idRoute: string; idPoint: string }>();

    const [scanning, setScanning] = useState(false);
    const [nfcSupported, setNfcSupported] = useState(false);
    const [secureContext, setSecureContext] = useState(false);

    const [lastSerial, setLastSerial] = useState<string>("");
    const [lastRecords, setLastRecords] = useState<Array<{ type: string; value: string }>>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // NEW: global API loading overlay
    const [loading, setLoading] = useState(false);

    // Skip modal states
    const [showSkipModal, setShowSkipModal] = useState(false);
    const [skipReason, setSkipReason] = useState("");
    const [submittingSkip, setSubmittingSkip] = useState(false);
    const modalInputRef = useRef<HTMLInputElement | null>(null);

    // token (ubah sesuai store-mu)
    const token = (typeof window !== "undefined" && localStorage.getItem("token")) || undefined;

    const fallbackRedirect = `/user/clocking/${idSite}/route/${idRoute}`;
    const doRedirect = (redirectUrl?: string | null) => navigate(-1);

    // === DEBUG PANEL ===
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const [debugOpen, setDebugOpen] = useState(false);

    useEffect(() => {
        const hasWindow = typeof window !== "undefined";
        const supported = hasWindow && "NDEFReader" in (window as any);
        setNfcSupported(!!supported);
        setSecureContext(hasWindow && (window as any).isSecureContext === true);
    }, []);

    useEffect(() => {
        if (showSkipModal) {
            const t = setTimeout(() => modalInputRef.current?.focus(), 10);
            return () => clearTimeout(t);
        }
    }, [showSkipModal]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!showSkipModal) return;
            if (e.key === "Escape") setShowSkipModal(false);
            if (e.key === "Enter") {
                e.preventDefault();
                handleSubmitSkip();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showSkipModal, skipReason]);

    const prettySupportText = useMemo(() => {
        if (!secureContext) return "Page bukan secure context. Pakai HTTPS atau http://localhost (ADB reverse).";
        if (!nfcSupported) return "Web NFC tidak didukung. Coba Chrome Android terbaru & aktifkan NFC.";
        return "";
    }, [secureContext, nfcSupported]);

    const decodeDataView = (data: any, encoding?: string) => {
        try {
            const dec = new TextDecoder(encoding || "utf-8");
            if (data instanceof DataView) return dec.decode(data.buffer);
            if (ArrayBuffer.isView(data)) return dec.decode(data as any);
            if (data instanceof ArrayBuffer) return dec.decode(new DataView(data));
            return String(data ?? "");
        } catch {
            return "[Binary]";
        }
    };

    const onReadRecords = (records: NDEFRecordLike[]) => {
        const parsed: Array<{ type: string; value: string }> = [];
        for (const rec of records) {
            const t = rec.recordType;
            if (t === "text") {
                parsed.push({ type: "text", value: decodeDataView(rec.data, rec.encoding) });
            } else if (t === "url") {
                parsed.push({ type: "url", value: decodeDataView(rec.data) });
            } else if (t === "mime") {
                parsed.push({
                    type: `mime (${rec.mediaType || "unknown"})`,
                    value: decodeDataView(rec.data),
                });
            } else {
                parsed.push({ type: t, value: decodeDataView(rec.data) });
            }
        }
        setLastRecords(parsed);
    };

    const startScan = async () => {
        setErrorMsg("");
        setLastSerial("");
        setLastRecords([]);

        if (!secureContext || !nfcSupported) {
            const msg = prettySupportText || "NFC not available.";
            setErrorMsg(msg);
            toast.error(msg);
            return;
        }
        if (!idPoint || !idSite || !idRoute) {
            setErrorMsg("Invalid route parameters.");
            toast.error("Invalid route parameters.");
            return;
        }

        if (scanning) return; // cegah double-scan
        setScanning(true);

        // Abort otomatis setelah 20 detik atau setelah 1x baca
        const ctrl = new AbortController();
        const timeout = setTimeout(() => {
            try { ctrl.abort(); } catch { }
            setScanning(false);
            toast.warn("Timeout: tidak ada tag terdeteksi.");
        }, 20000);

        try {
            const NDEFReaderCtor = (window as any).NDEFReader as any;
            if (!NDEFReaderCtor) {
                throw new Error("Web NFC tidak tersedia di browser ini.");
            }

            const ndef = new NDEFReaderCtor();

            // Pasang listener LEBIH DULU (beberapa device lebih stabil)
            const onReading = async (event: any) => {
                try {
                    try { ctrl.abort(); } catch { }
                    clearTimeout(timeout);

                    const { serialNumber, message } = event;
                    const serial = String(serialNumber || "");
                    setLastSerial(serial);
                    onReadRecords(message?.records || []);

                    // === API: SCAN ===
                    setLoading(true);
                    try {
                        const resp = await guardTourService.scan(token, {
                            point_id: idPoint,
                            nfc_serial: serial,
                        });
                        if (resp?.ok !== false) {
                            toast.success(resp?.toast || "NFC tag verified.");
                            doRedirect(resp?.redirect_url);
                        } else {
                            toast.error(resp?.message || "Wrong NFC tag for this point.");
                        }
                    } catch (apiErr: any) {
                        toast.error(apiErr?.message || "Failed to verify NFC tag.");
                    } finally {
                        setLoading(false);
                    }
                } finally {
                    setScanning(false);
                }
            };

            const onReadingError = (e: any) => {
                console.warn("onreadingerror", e);
                toast.warn("Baca NFC gagal. Tempelkan tag lebih dekat & stabil.");
            };

            ndef.addEventListener?.("reading", onReading);
            ndef.addEventListener?.("readingerror", onReadingError);
            ndef.onreading = onReading;
            ndef.onreadingerror = onReadingError;

            await ndef.scan({ signal: ctrl.signal });

            toast.info("Mendengarkan tag... Tempelkan tag ke belakang ponsel.");
        } catch (err: any) {
            clearTimeout(timeout);
            setScanning(false);

            // Granular error handling
            const msg = String(err?.message || err || "");
            console.error("scan() error:", err);

            if (err?.name === "NotAllowedError") {
                setErrorMsg("Izin ditolak atau NFC dimatikan. Pastikan NFC aktif & layar tidak terkunci.");
                toast.error("Izin ditolak / NFC dimatikan.");
            } else if (err?.name === "NotSupportedError") {
                setErrorMsg("Perangkat tidak mendukung Web NFC atau mode tidak tersedia.");
                toast.error("Web NFC tidak didukung.");
            } else if (err?.name === "NotReadableError") {
                setErrorMsg("NFC sedang dipakai aplikasi lain. Tutup app lain yang memakai NFC.");
                toast.error("NFC sedang dipakai app lain.");
            } else if (msg.includes("Only secure contexts")) {
                setErrorMsg("Harus HTTPS atau http://localhost (secure context).");
                toast.error("Secure context dibutuhkan.");
            } else if (msg.toLowerCase().includes("operation aborted")) {
                // dari AbortController — sudah ada toast timeout
            } else {
                setErrorMsg(msg || "Gagal memulai NFC.");
                toast.error(msg || "Gagal memulai NFC.");
            }
        }
    };

    const handleOpenSkip = () => {
        setSkipReason("");
        setShowSkipModal(true);
    };

    const handleSubmitSkip = async () => {
        if (skipReason.trim().length < 5) {
            const msg = "Please provide at least 5 characters for the reason.";
            setErrorMsg(msg);
            toast.error("Reason minimal 5 karakter.");
            return;
        }
        if (!idPoint || !idSite || !idRoute) {
            setErrorMsg("Invalid route parameters.");
            toast.error("Invalid route parameters.");
            return;
        }
        setSubmittingSkip(true);
        setErrorMsg("");
        setLoading(true);
        try {
            const resp = await guardTourService.skip(token, {
                point_id: idPoint,
                reason: skipReason.trim(),
            });
            toast.success(resp?.toast || "Skip recorded.");
            doRedirect(resp?.redirect_url);
        } catch (e: any) {
            const msg = e?.message || "Failed to submit skip reason.";
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setSubmittingSkip(false);
            setShowSkipModal(false);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181D26] text-white flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#222630]">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-300 hover:text-white">
                    <ArrowLeft size={20} className="mr-2" />
                    <span className="text-lg font-medium">Point</span>
                </button>

                {/* Debug toggle */}
                <button
                    onClick={() => setDebugOpen((v) => !v)}
                    className="text-xs px-2 py-1 rounded border border-[#2b3342] text-white/70 hover:text-white hover:bg-[#222630]"
                >
                    {debugOpen ? "Hide" : "Debug"}
                </button>
            </div>

            {/* DEBUG PANEL */}
            {debugOpen && (
                <div className="px-4 py-3 text-xs text-white/80 bg-[#10141b] border-b border-[#222630] space-y-1">
                    <div>secureContext: <b>{String(secureContext)}</b></div>
                    <div>nfcSupported: <b>{String(nfcSupported)}</b></div>
                    <div>userAgent: <span className="break-all">{ua}</span></div>
                    <div>params: site={idSite} route={idRoute} point={idPoint}</div>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
                {/* NFC Illustration */}
                <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path
                        d="M204.269 10.9155H187.571V26.6721H204.269C209.174 26.6721 213.165 30.6626 213.165 35.5676V52.2654H228.921V35.5676C228.921 21.9743 217.863 10.9155 204.269 10.9155ZM26.7185 35.5676C26.7185 30.6626 30.7089 26.6721 35.6139 26.6721H52.3122V10.9155H35.6139C22.0207 10.9155 10.9619 21.9743 10.9619 35.5676V52.2654H26.7185V35.5676ZM213.165 204.223C213.165 209.128 209.174 213.118 204.269 213.118H187.571V228.875H204.269C217.863 228.875 228.921 217.816 228.921 204.223V187.525H213.165V204.223ZM26.7185 204.223V187.525H10.9619V204.223C10.9619 217.816 22.0207 228.875 35.6139 228.875H52.3122V213.118H35.6139C30.7089 213.118 26.7185 209.128 26.7185 204.223Z"
                        fill="#2E3544"
                    />
                    <path d="M221.043 112.017H18.8398V127.773H221.043V112.017Z" fill="#2E3544" />
                </svg>

                {/* Hint / Status */}
                {!nfcSupported || !secureContext ? (
                    <div className="text-center text-sm text-white/80 max-w-xs">{prettySupportText}</div>
                ) : (
                    <div className="text-center text-sm text-white/80 max-w-xs">
                        Tap <span className="font-semibold">Scan NFC</span>, lalu tempelkan tag ke belakang perangkat.
                    </div>
                )}

                {/* Error */}
                {errorMsg && <div className="text-center text-sm text-[#FF7E6A] max-w-sm">{errorMsg}</div>}

                {/* Read result */}
                {(lastSerial || lastRecords.length > 0) && (
                    <div className="w-full max-w-md bg-[#222630] rounded-lg p-4 text-sm">
                        {lastSerial ? (
                            <p className="mb-2 text-white/90">
                                <span className="text-white/60">Tag serial:</span> {lastSerial}
                            </p>
                        ) : null}
                        {lastRecords.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {lastRecords.map((r, idx) => (
                                    <div key={idx} className="rounded-md bg-[#1A1E27] px-3 py-2 text-white/90">
                                        <div className="text-white/60 text-xs uppercase tracking-wide">{r.type}</div>
                                        <div className="break-words">{r.value}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/60">No NDEF records.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="p-4 flex items-center justify-center gap-3">
                <button
                    onClick={startScan}
                    disabled={!nfcSupported || !secureContext || scanning}
                    className={`inline-flex items-center gap-2 rounded-full py-3 px-6 transition ${!nfcSupported || !secureContext
                            ? "bg-[#EFBF04]/50 cursor-not-allowed text-black"
                            : scanning
                                ? "bg-[#EFBF04]/70 text-black"
                                : "bg-[#EFBF04] hover:bg-[#e6b832] text-black"
                        }`}
                >
                    <Wifi size={18} />
                    {scanning ? "Scanning..." : "Scan NFC"}
                </button>

                <button
                    onClick={handleOpenSkip}
                    className="w-fit bg-transparent border border-[#3a4152] text-white font-medium py-3 px-6 rounded-full hover:bg-[#222630] transition"
                >
                    Skip
                </button>
            </div>

            {/* Skip Reason Modal */}
            {showSkipModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" aria-modal="true" role="dialog">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSkipModal(false)} />
                    <div className="relative w-full sm:w-[520px] bg-[#1A1E27] rounded-t-2xl sm:rounded-2xl border border-[#2b3342] p-5 sm:p-6 shadow-2xl">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Skip NFC Scan</h3>
                            <p className="text-sm text-white/70">Please provide a reason before skipping. This helps us keep an accurate record.</p>
                        </div>

                        <label className="block text-sm text-white/70 mb-2">
                            Reason <span className="text-[#FF7E6A]">*</span>
                        </label>
                        <input
                            ref={modalInputRef}
                            type="text"
                            value={skipReason}
                            onChange={(e) => setSkipReason(e.target.value)}
                            placeholder="e.g., Device NFC not working, tag is damaged, no access to the area"
                            className="w-full rounded-lg bg-[#121721] border border-[#2b3342] px-3 py-3 text-sm outline-none focus:border-[#EFBF04]"
                            maxLength={200}
                        />
                        <div className="mt-1 text-xs text-white/50">{skipReason.length}/200</div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button onClick={() => setShowSkipModal(false)} className="px-4 py-2 rounded-full border border-[#3a4152] text-white hover:bg-[#222630] transition">
                                Cancel
                            </button>
                            <button
                                disabled={submittingSkip || skipReason.trim().length < 5}
                                onClick={handleSubmitSkip}
                                className={`px-5 py-2 rounded-full transition ${submittingSkip || skipReason.trim().length < 5
                                        ? "bg-[#EFBF04]/60 cursor-not-allowed text-black"
                                        : "bg-[#EFBF04] hover:bg-[#e6b832] text-black"
                                    }`}
                            >
                                {submittingSkip ? "Submitting..." : "Submit & Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GLOBAL LOADING OVERLAY */}
            {loading && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-xl bg-[#121721] border border-[#2b3342] px-4 py-3">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-sm">Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanClocking;

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NDEFRecordLike = {
  recordType: string;
  mediaType?: string;
  encoding?: string;
  data: any; // DataView / ArrayBuffer / TypedArray
};

const GuardScan = () => {
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [secureContext, setSecureContext] = useState(false);

  const [lastSerial, setLastSerial] = useState<string>("");
  const [lastRecords, setLastRecords] = useState<
    Array<{ type: string; value: string }>
  >([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const hasWindow = typeof window !== "undefined";
    // cek dukungan Web NFC via window
    const supported = hasWindow && "NDEFReader" in (window as any);
    setNfcSupported(!!supported);
    setSecureContext(hasWindow && (window as any).isSecureContext === true);
  }, []);

  const prettySupportText = useMemo(() => {
    if (!secureContext)
      return "This page is not in a secure context. Use HTTPS or localhost.";
    if (!nfcSupported)
      return "Web NFC is not supported on this device/browser. Try Chrome on Android.";
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
        parsed.push({
          type: "text",
          value: decodeDataView(rec.data, rec.encoding),
        });
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
      setErrorMsg(prettySupportText || "NFC not available.");
      return;
    }

    setScanning(true);
    try {
      // ⬇️ FIX: ambil constructor dari window agar TS nggak error
      const NDEFReaderCtor = (window as any).NDEFReader as any;
      if (!NDEFReaderCtor) {
        setErrorMsg("Web NFC not available on this browser.");
        setScanning(false);
        return;
      }

      const ndef = new NDEFReaderCtor();
      await ndef.scan(); // harus dipicu click user

      ndef.onreadingerror = () => {
        setErrorMsg("NFC read error. Try again and hold the tag closer.");
      };

      ndef.onreading = (event: any) => {
        const { serialNumber, message } = event;
        setLastSerial(String(serialNumber || ""));
        onReadRecords(message?.records || []);
        // contoh: auto-navigate setelah scan sukses
        // navigate("/user/guard-tour/selection/scan/choice");
      };
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to start NFC.");
      setScanning(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#181D26] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#222630]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-lg font-medium">Point 1</span>
        </button>
        <svg
          width="22"
          height="20"
          viewBox="0 0 22 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
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

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        {/* NFC Illustration */}
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M204.269 10.9155H187.571V26.6721H204.269C209.174 26.6721 213.165 30.6626 213.165 35.5676V52.2654H228.921V35.5676C228.921 21.9743 217.863 10.9155 204.269 10.9155ZM26.7185 35.5676C26.7185 30.6626 30.7089 26.6721 35.6139 26.6721H52.3122V10.9155H35.6139C22.0207 10.9155 10.9619 21.9743 10.9619 35.5676V52.2654H26.7185V35.5676ZM213.165 204.223C213.165 209.128 209.174 213.118 204.269 213.118H187.571V228.875H204.269C217.863 228.875 228.921 217.816 228.921 204.223V187.525H213.165V204.223ZM26.7185 204.223V187.525H10.9619V204.223C10.9619 217.816 22.0207 228.875 35.6139 228.875H52.3122V213.118H35.6139C30.7089 213.118 26.7185 209.128 26.7185 204.223Z"
            fill="#2E3544"
          />
          <path
            d="M221.043 112.017H18.8398V127.773H221.043V112.017Z"
            fill="#2E3544"
          />
        </svg>

        {/* Hint / Status */}
        {!nfcSupported || !secureContext ? (
          <div className="text-center text-sm text-white/80 max-w-xs">
            {prettySupportText}
          </div>
        ) : (
          <div className="text-center text-sm text-white/80 max-w-xs">
            Tap <span className="font-semibold">Scan NFC</span>, lalu tempelkan
            tag ke belakang perangkat.
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="text-center text-sm text-[#FF7E6A] max-w-sm">
            {errorMsg}
          </div>
        )}

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
                  <div
                    key={idx}
                    className="rounded-md bg-[#1A1E27] px-3 py-2 text-white/90"
                  >
                    <div className="text-white/60 text-xs uppercase tracking-wide">
                      {r.type}
                    </div>
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

      <div className="p-4 flex items-center justify-center gap-3">
        <button
          onClick={startScan}
          disabled={!nfcSupported || !secureContext || scanning}
          className={`inline-flex items-center gap-2 rounded-full py-3 px-6 transition ${
            !nfcSupported || !secureContext
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
          onClick={() => navigate("/user/guard-tour/selection/scan/choice")}
          className="w-fit bg-transparent border border-[#3a4152] text-white font-medium py-3 px-6 rounded-full hover:bg-[#222630] transition"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default GuardScan;

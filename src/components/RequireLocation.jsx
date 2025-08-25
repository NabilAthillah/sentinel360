import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RequireLocation({
  children,
  fallback = "/user/settings",
}) {
  const [status, setStatus] = useState("unknown");
  const [geoError, setGeoError] = useState("");
  const navigate = useNavigate();
  const route = useLocation();

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setGeoError("Geolocation is not supported by this browser.");
      navigate(fallback, { replace: true, state: { from: route.pathname } });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setGeoError("Location permission was denied.");
          navigate(fallback, {
            replace: true,
            state: { from: route.pathname },
          });
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("error");
          setGeoError("Location is unavailable. Please try again.");
        } else if (err.code === err.TIMEOUT) {
          setStatus("prompt");
          setGeoError("Location request timed out. Please retry.");
        } else {
          setStatus("error");
          setGeoError(err.message || "Unexpected geolocation error.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [fallback, navigate, route.pathname]);

  useEffect(() => {
    let perm;
    (async () => {
      try {
        if ("permissions" in navigator && navigator.permissions?.query) {
          perm = await navigator.permissions.query({ name: "geolocation" });
          setStatus(perm.state);
          if (perm.state === "prompt") requestLocation();
          if (perm.state === "denied") {
            navigate(fallback, {
              replace: true,
              state: { from: route.pathname },
            });
          }
          perm.onchange = () => {
            setStatus(perm.state);
            if (perm.state === "denied") {
              navigate(fallback, {
                replace: true,
                state: { from: route.pathname },
              });
            }
          };
          return;
        }
      } catch (_) {
      }
      requestLocation();
    })();

    return () => {
      if (perm) perm.onchange = null;
    };
  }, [navigate, fallback, route.pathname, requestLocation]);

  if (status === "granted") return <>{children}</>;

  return (
    <LocationPermissionOverlay geoError={geoError} onRetry={requestLocation} />
  );
}

function LocationPermissionOverlay({ geoError, onRetry }) {
  const openBrowserLocationSettings = useCallback(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android")) {
      window.open(
        "https://support.google.com/chrome/answer/142065?hl=en",
        "_blank"
      );
    } else if (
      ua.includes("iphone") ||
      ua.includes("ipad") ||
      ua.includes("ipod")
    ) {
      alert(
        "iOS: Settings → Privacy & Security → Location Services → Safari → Allow"
      );
    } else if (ua.includes("firefox")) {
      window.open("about:preferences#privacy", "_blank");
    } else {
      window.open(
        "https://support.google.com/chrome/answer/142065?hl=en",
        "_blank"
      );
    }
  }, []);

  return (
    <div className="absolute inset-0 z-30 bg-[#181D26] text-white flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l3 7h7l-5.5 4.1L18 21l-6-4-6 4 1.5-7.9L2 9h7l3-7z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Location permission required</h2>
        <p className="text-sm text-white/80">
          We need your location to continue. Please allow location access when
          prompted.
        </p>
        {geoError && <p className="text-xs text-red-400">{geoError}</p>}
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full bg-[#EFBF04] text-[#181D26] font-medium"
          >
            Retry permission
          </button>
          <button
            onClick={openBrowserLocationSettings}
            className="px-4 py-2 rounded-full border border-white/30 text-white"
          >
            Open browser settings
          </button>
        </div>
        <div className="mt-4 text-xs text-white/60 space-y-1">
          <p>Quick tips:</p>
          <p>
            • Chrome: Settings → Privacy & security → Site settings → Location
          </p>
          <p>
            • Safari iOS: Settings → Privacy & Security → Location Services →
            Safari → Allow
          </p>
        </div>
      </div>
    </div>
  );
}

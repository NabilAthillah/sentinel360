import { Circle, GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };

type Props = {
  userPos: LatLng | null;
  sitePos?: LatLng | null;
  siteRadius?: number;
  userAccuracy?: number;
};

const containerStyle: React.CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
  flex: "1 1",
  minHeight: "500px",
  borderRadius: "16px",
};

const DEFAULT_CENTER: LatLng = { lat: 1.3521, lng: 103.8198 };

const MapUser = ({ userPos, sitePos, siteRadius, userAccuracy }: Props) => {
  const center = useMemo<LatLng>(() => userPos ?? sitePos ?? DEFAULT_CENTER, [userPos, sitePos]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapsReady, setMapsReady] = useState(false);

  const zoom = userPos || sitePos ? 16 : 11;

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userPos && sitePos) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userPos);
      bounds.extend(sitePos);
      map.fitBounds(bounds, 64);
    } else {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [userPos, sitePos, center, zoom]);

  const userIcon = useMemo(() => {
    const gm = (window as any).google?.maps;
    const circle = gm?.SymbolPath?.CIRCLE;

    if (circle) {
      return {
        path: circle,
        scale: 8,
        fillColor: "#1A73E8",
        fillOpacity: 1,
        strokeColor: "#0F5CC0",
        strokeWeight: 1,
        anchor: { x: 0, y: 0 } as any,
      } as google.maps.Symbol;
    }

    return {
      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      scaledSize: { width: 32, height: 32 } as any,
      anchor: { x: 16, y: 32 } as any,
    };
  }, [mapsReady]);

  const siteIcon = useMemo(() => {
    const gm = (window as any).google?.maps;
    const arrow = gm?.SymbolPath?.BACKWARD_CLOSED_ARROW;

    if (arrow) {
      return {
        path: arrow,
        scale: 6,
        fillColor: "#0BBF6A",
        fillOpacity: 1,
        strokeColor: "#0A8E52",
        strokeWeight: 1,
      } as google.maps.Symbol;
    }

    return {
      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      scaledSize: { width: 32, height: 32 } as any,
      anchor: { x: 16, y: 32 } as any,
    };
  }, [mapsReady]);

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        options={{
          mapTypeControl: true,
          mapTypeControlOptions: { style: 1 },
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
      >
        {sitePos && (
          <Marker
            position={sitePos}
            label={{
              text: "SITE",
              className: "text-[10px] font-bold",
              color: "#0B5",
            }}
            icon={siteIcon as any}
          />
        )}

        {sitePos && Number.isFinite(siteRadius) && siteRadius! > 0 && (
          <Circle
            center={sitePos}
            radius={siteRadius}
            options={{
              strokeColor: "#2EB875",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#2EB875",
              fillOpacity: 0.12,
            }}
          />
        )}

        {userPos && (
          <Marker
            position={userPos}
            label={{
              text: "YOU",
              className: "text-[10px] font-bold",
              color: "#1A73E8",
            }}
            icon={userIcon as any}
          />
        )}

        {userPos && Number.isFinite(userAccuracy) && userAccuracy! > 0 && (
          <Circle
            center={userPos}
            radius={userAccuracy}
            options={{
              strokeColor: "#1A73E8",
              strokeOpacity: 0.5,
              strokeWeight: 1,
              fillColor: "#1A73E8",
              fillOpacity: 0.1,
            }}
          />
        )}
      </GoogleMap>
  );
};

export default MapUser;

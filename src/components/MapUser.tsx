import { useEffect, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

type Props = {
  userPos: { lat: number; lng: number } | null;
};

const containerStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  flex: "1 1",
  minHeight: "500px",
  borderRadius: "16px",
};

const DEFAULT_CENTER = { lat: 1.3521, lng: 103.8198 };

const MapUser = ({ userPos }: Props) => {
  const center = useMemo(() => userPos ?? DEFAULT_CENTER, [userPos]);
  useEffect(() => {
    console.log(userPos)
  }, [])
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || "AIzaSyApktDuyS7d_DUd8uIDZZeL5KauAlxlc-M"}
      language="en"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={userPos ? 16 : 11}
        options={{
          mapTypeControl: true,
          mapTypeControlOptions: { style: 1 },
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {userPos && <Marker position={userPos} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapUser;

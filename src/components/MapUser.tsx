import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  flex: "1 1",
  minHeight: "500px",
  borderRadius: "16px",
};

const DEFAULT_CENTER = { lat: 1.3521, lng: 103.8198 };

const MapUser = () => {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyApktDuyS7d_DUd8uIDZZeL5KauAlxlc-M"
      language="en"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userPos ?? DEFAULT_CENTER}
        zoom={userPos ? 15 : 11}
        options={{ mapTypeControl: true, mapTypeControlOptions: { style: 1 } }}
      >
        {userPos && <Marker position={userPos} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapUser;

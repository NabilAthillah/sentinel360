import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Site } from "../types/site";

const containerStyle = {
    height: "100%",
    width: "100%",
    display: "flex",
    flex: "1 1",
    minHeight: '500px',
    borderRadius: '16px'
};

const center = {
    lat: 1.3521,
    lng: 103.8198,
};

const Map = ({ sites }: { sites: Site[] }) => {
    return (
        <LoadScript googleMapsApiKey="AIzaSyApktDuyS7d_DUd8uIDZZeL5KauAlxlc-M" language="en">
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11} options={{ mapTypeControl: true, mapTypeControlOptions: { style: 1 } }}>
                {sites.length > 0 && sites.map((location, idx) => {
                    const marker = {
                        lat: parseFloat(location.lat),
                        lng: parseFloat(location.long)
                    }

                    return (
                        <Marker key={idx} position={marker} />
                    )
                })}
            </GoogleMap>
        </LoadScript>
    )
}

export default Map
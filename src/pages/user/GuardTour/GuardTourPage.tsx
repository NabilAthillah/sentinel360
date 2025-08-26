import React, { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft, Wifi } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import routeService from "../../../services/routeService";
import { Site } from "../../../types/site";
import { SiteEmployee } from "../../../types/siteEmployee";

type Settings = {
    label: string;
    placeholder: string;
    value: string;
};

const GuardTourPage = () => {
    const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.token.token);
    const [sites, setSites] = useState<Site[]>([]);
    const [siteEmployee, setSiteEmployee] = useState<SiteEmployee>();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<Settings[]>([]);
    const [isSecondHome, setIsSecondHome] = useState(false);
    const { idSite } = useParams<{ idSite: string }>();
    const fetchRoutes = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await routeService.getAllRoutes(token);
            setRoutes(response.data); 
        } catch (err: any) {
            console.error("Failed to fetch routes", err.message || err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutesByid = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await routeService.gethRouteById(token);
            if (response.success) {
                setRoutes(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch routes", err.message || err);
        } finally {
            setLoading(false);
        }
    };;
    const getDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const checkLocation = (currentLat: number, currentLng: number) => {
        if (!sites || sites.length === 0) return;

        const geoFencingStr = settings.find((d) =>
            d.label.toLowerCase().includes("geo fencing")
        )?.value;
        const geoFencing = geoFencingStr ? Number(geoFencingStr) : 0;

        if (geoFencing === 0) {
            console.warn("Geo fencing setting tidak ditemukan atau 0");
            return;
        }

        const nearestSite = sites.find((site) => {
            const dist = getDistance(
                currentLat,
                currentLng,
                Number(site.lat),
                Number(site.long)
            );
            return dist <= geoFencing;
        });

        if (!nearestSite) {
            setIsSecondHome(true);
            return;
        }

        if (!siteEmployee || siteEmployee?.site.id !== nearestSite.id) {
            setIsSecondHome(true);
        } else {
            setIsSecondHome(false);
        }
    }
    useEffect(() => {
        fetchRoutes();
        fetchRoutesByid()
    }, [token]);

    return (
        <div className="min-h-screen bg-[#181D26] text-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#222630]">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-300 hover:text-white"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span className="text-lg font-medium">Guard Tour</span>
                </button>
                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.56836 17.75C5.8591 18.4185 6.33878 18.9876 6.94847 19.3873C7.55817 19.787 8.27133 20 9.00036 20C9.72939 20 10.4426 19.787 11.0522 19.3873C11.6619 18.9876 12.1416 18.4185 12.4324 17.75H5.56836Z" fill="#374957" />
                    <path d="M16.7939 11.4118L15.4919 7.11951C15.0749 5.61827 14.1684 4.29934 12.9163 3.37213C11.6641 2.44493 10.1381 1.9626 8.58054 2.00172C7.02297 2.04084 5.5231 2.59917 4.31908 3.58806C3.11507 4.57696 2.27591 5.93973 1.93486 7.46001L0.923856 11.6128C0.789481 12.1646 0.782201 12.7397 0.902564 13.2947C1.02293 13.8498 1.26779 14.3702 1.61867 14.8168C1.96956 15.2634 2.41729 15.6245 2.92809 15.8727C3.43889 16.121 3.99942 16.25 4.56736 16.25H13.2051C13.7907 16.25 14.3681 16.1129 14.8911 15.8497C15.4142 15.5864 15.8683 15.2044 16.2171 14.7341C16.566 14.2638 16.7998 13.7183 16.9 13.1414C17.0001 12.5645 16.9638 11.9721 16.7939 11.4118Z" fill="#374957" />
                    <rect x="12" width="10" height="10" rx="5" fill="#19CE74" />
                    <path d="M15.4078 8V7.55256L17.0882 5.71307C17.2855 5.49763 17.4479 5.31037 17.5755 5.15128C17.7031 4.99053 17.7975 4.83973 17.8588 4.69886C17.9218 4.55634 17.9533 4.4072 17.9533 4.25142C17.9533 4.07244 17.9102 3.9175 17.824 3.78658C17.7395 3.65566 17.6235 3.55457 17.476 3.48331C17.3285 3.41205 17.1628 3.37642 16.9789 3.37642C16.7833 3.37642 16.6126 3.41702 16.4668 3.49822C16.3226 3.57777 16.2108 3.68963 16.1312 3.83381C16.0533 3.97798 16.0144 4.14702 16.0144 4.34091H15.4277C15.4277 4.04261 15.4965 3.78078 15.6341 3.5554C15.7716 3.33002 15.9589 3.15436 16.1958 3.02841C16.4345 2.90246 16.7021 2.83949 16.9988 2.83949C17.2971 2.83949 17.5614 2.90246 17.7917 3.02841C18.0221 3.15436 18.2027 3.32422 18.3336 3.538C18.4645 3.75178 18.53 3.98958 18.53 4.25142C18.53 4.43868 18.496 4.6218 18.4281 4.80078C18.3618 4.9781 18.2458 5.17614 18.0801 5.39489C17.916 5.61198 17.6882 5.87713 17.3965 6.19034L16.253 7.41335V7.45312H18.6195V8H15.4078Z" fill="#181D26" />
                </svg>

            </div>

            <div className="flex flex-col gap-3 p-4">
                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    routes.map((route) => (
                        <button
                            key={route.id}
                            onClick={() => navigate(`/user/guard-tours/${idSite}/route/${route.id}/point`)}
                            className="flex items-center justify-between bg-[#222630] hover:bg-[#2a2f3a] px-4 py-3 rounded-md transition text-left"
                        >
                            <span className="text-sm">{route.name}</span>
                            <ChevronRight size={18} className="text-gray-400" />
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default GuardTourPage;

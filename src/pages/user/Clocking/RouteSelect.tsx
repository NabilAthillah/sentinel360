import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Site } from '../../../types/site';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import siteService from '../../../services/siteService';
import { CheckCircle2, ChevronLeft, Circle } from 'lucide-react';

const RouteSelect = () => {
    const navigate = useNavigate();
    const [sites, setSite] = useState<Site>();
    const [routes, setRoutes] = useState<any[]>([]);
    const token = useSelector((state: RootState) => state.token.token);
    const user = useSelector((state: RootState) => state.user.user);
    const { idSite } = useParams<{ idSite: string }>();
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    const fetchSite = async () => {
        console.log("fecthsite")
        if (!token || !idSite) return;
        try {
            const res = await siteService.getSiteById(idSite, token);
            if (res?.success) {
                const s = res.data?.site ?? res.data;
                setSite(s);
                setRoutes(s?.routes ?? []);
            }
        } catch (e: any) {
            console.error(e?.message || e);
        }
    };
    useEffect(() => {
        fetchSite();
    }, [token, idSite]);
    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 ">
            <div className='flex items-center gap-2 px-4 pt-6'>
                <button onClick={() => navigate(-1)}>
                    <ChevronLeft className='text-[#F4F7FF]' />
                </button>
                <h1 className='text-lg text-[#F4F7FF] font-semibold'>{sites?.name}</h1>
            </div>
            <div className="flex-1 px-6 py-8">
                {routes.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {routes.map((route, i) => {
                            const isSelected = selectedRoute === route.id;
                            return (
                                <div
                                    key={route.id ?? i}
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() =>
                                        setSelectedRoute((prev) => (prev === route.id ? null : route.id))
                                    }
                                >
                                    {isSelected ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            version="1.1"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M2,12C2,6.48,6.48,2,12,2C17.52,2,22,6.48,22,12C22,17.52,17.52,22,12,22C6.48,22,2,17.52,2,12ZM4,12C4,16.42,7.58,20,12,20C16.42,20,20,16.42,20,12C20,7.58,16.42,4,12,4C7.58,4,4,7.58,4,12ZM17,12C17,14.76,14.76,17,12,17C9.24,17,7,14.76,7,12C7,9.24,9.24,7,12,7C14.76,7,17,9.24,17,12Z"
                                                fill="#EFBF04"
                                            />
                                        </svg>
                                    ) : (
                                        <Circle size={22} className="text-gray-400" />
                                    )}
                                    <span className="text-base">{route.name}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-[#98A1B3]">No routes available</p>
                )}
            </div>

            <div className="px-6 pb-8 mt-auto">
                <button
                    className={`w-full py-4 rounded-full text-lg font-medium transition ${selectedRoute
                            ? "bg-[#EFBF04] text-black"
                            : "bg-gray-600 text-gray-300 cursor-not-allowed"
                        }`}
                    disabled={!selectedRoute}
                    onClick={() => {
                        if (selectedRoute) {
                            console.log("Scan NFC for route:", selectedRoute);
                        }
                    }}
                >
                    Scan NFC tag
                </button>
            </div>
        </div>
    )
}

export default RouteSelect
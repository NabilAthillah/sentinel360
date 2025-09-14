import { ChevronLeft, Pencil, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import IncidentService from "../../../services/incidentService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface IncidentDetails {
    location: string;
    what: string;
    why: string;
    how: string;
    injured: string;
    reportMgmt: string;
    remarks: string;
    reportPolice: string;
    damage: string;
    picture: string;
    cctv: string;
    detailIncident: string;
}

interface Incident {
    id: string;
    title: string;
    date: string;
    person: string;
    acknowledged: string;
    details: IncidentDetails;
}

const History: React.FC = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Incident | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const token = useSelector((state: RootState) => state.token.token);
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await IncidentService.getIncident(token);

                const mappedData: Incident[] = res.data.map((item: any) => ({
                    id: item.id,
                    title: item.incident_type?.name || "Incident",
                    date: item.incident_date,
                    person: item.person_involved,
                    acknowledged: item.user?.name || "-",
                    details: {
                        location: item.location,
                        what: item.why_happened,
                        why: item.why_happened,
                        how: item.how_it_happened,
                        injured: item.person_injured,
                        reportMgmt: item.reported_to_management ? "Yes" : "No",
                        remarks: item.remarks,
                        reportPolice: item.reported_to_police ? "Yes" : "No",
                        damage: item.any_damages_to_property ? "Yes" : "No",
                        picture: item.any_pictures_attached ? "Yes" : "No",
                        cctv: item.cctv_footage ? "Yes" : "No",
                        detailIncident: item.conclution,
                    },
                }));

                setIncidents(mappedData);
            } catch (err) {
                console.error("Error fetching incidents:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-4 pt-20">

            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">History</h1>
            </div>

            {loading ? (
                <p className="text-center mt-10">Loading...</p>
            ) : incidents.length === 0 ? (
                <p className="text-center mt-10">No incidents found</p>
            ) : (
                incidents.map((item) => (
                    <div
                        key={item.id}
                        className="bg-[#252C38] p-4 rounded-lg flex flex-col gap-3"
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-[#EFBF04] font-semibold">{item.title}</p>
                            <div className="flex gap-3 text-[#98A1B3]">
                                <Pencil size={16} className="cursor-pointer" />
                                <Trash2 size={16} className="cursor-pointer" />
                            </div>
                        </div>

                        <div className="text-sm text-[#98A1B3] gap-2 flex flex-col">
                            <div>
                                <p className="mb-1 text-xs">Date & time</p>
                                <p className="text-[#F4F7FF]">{item.date}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs underline cursor-pointer">
                                    Persons involved
                                </p>
                                <p className="text-[#F4F7FF]">{item.person}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs">Acknowledged by</p>
                                <p className="text-[#F4F7FF]">{item.acknowledged}</p>
                            </div>
                        </div>

                        <button
                            className="mt-2 border border-[#EFBF04] text-[#EFBF04] rounded-full px-5 py-2 text-sm font-medium w-fit"
                            onClick={() => setSelected(item)}
                        >
                            View more
                        </button>
                    </div>
                ))
            )}

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 pt-20 flex items-center justify-center z-50">
                    <div className="flex-1 bg-[#F4F7FF] text-[#181D26] p-5 rounded-t-2xl max-w-md w-full h-full relative">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-3 right-3"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">{selected.title}</h2>

                        <div className="text-sm space-y-3">
                            <div>
                                <p className="text-gray-500">Date & time</p>
                                <p>{selected.date}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">What happened</p>
                                <p>{selected.details.what}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Location</p>
                                <p>{selected.details.location}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Why it happened</p>
                                <p>{selected.details.why}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">How it happened</p>
                                <p>{selected.details.how}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Persons involved</p>
                                <p>{selected.person}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Persons injured</p>
                                <p>{selected.details.injured}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Incident reported to management</p>
                                <p>{selected.details.reportMgmt}</p>
                                <p>{selected.details.remarks}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Remarks</p>
                                <p>{selected.details.remarks}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">
                                    Incident reported to Police/ SCDF
                                </p>
                                <p>{selected.details.reportPolice}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Any damage to property</p>
                                <p>{selected.details.damage}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Any picture attached</p>
                                <p>{selected.details.picture}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Any CCTV footage</p>
                                <p>{selected.details.cctv}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Detail of incident</p>
                                <p>{selected.details.detailIncident}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;

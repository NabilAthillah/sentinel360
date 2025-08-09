import React, { useState } from "react";
import { ChevronLeft, Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    id: number;
    title: string;
    date: string;
    person: string;
    acknowledged: string;
    details: IncidentDetails;
}

const History: React.FC = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Incident | null>(null);

    const data: Incident[] = [
        {
            id: 1,
            title: "Alarm activation",
            date: "14 May 2025, Friday, 11:45AM",
            person: "Vincent",
            acknowledged: "Siva",
            details: {
                location: "Lift lobby",
                what: "Accident",
                why: "Wire trip",
                how: "Power trip",
                injured: "2",
                reportMgmt: "Yes",
                remarks: "No remarks to mentioned",
                reportPolice: "No",
                damage: "No",
                picture: "No",
                cctv: "No",
                detailIncident: "-",
            },
        },
        {
            id: 2,
            title: "Alarm activation",
            date: "14 May 2025, Friday, 11:45AM",
            person: "Vincent",
            acknowledged: "Siva",
            details: {
                location: "Lift lobby",
                what: "Accident",
                why: "Wire trip",
                how: "Power trip",
                injured: "2",
                reportMgmt: "Yes",
                remarks: "No remarks to mentioned",
                reportPolice: "No",
                damage: "No",
                picture: "No",
                cctv: "No",
                detailIncident: "-",
            },
        },
    ];

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-4">
           
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        size={20}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-xl text-[#F4F7FF] font-normal">HDB</h1>
                </div>
            </div>

            {data.map((item) => (
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
            ))}

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 pt-20 flex items-center justify-center z-50">
                    <div className="flex-1 bg-[#F4F7FF] text-[#181D26] p-5 rounded-t-2xl  max-w-md w-full h-full relative  ">
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
                                <p className="text-gray-500 underline cursor-pointer">
                                    What happened
                                </p>
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

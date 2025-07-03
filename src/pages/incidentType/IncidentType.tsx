import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MainLayout from "../../layouts/MainLayout";

interface Incident {
    id: number;
    date: string;
    time: string;
    siteName: string;
    incident: string;
    reportedBy: string;
    image?: string;
}

const IncidentFree = () => {
    const [incidentData, setIncidentData] = useState<Incident[]>([]);
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const setAddIncident = (value: boolean) => {

    }
    const fetchIncidents = async () => {
        setIsLoading(true);
        try {

            const dummyData: Incident[] = [
                {
                    id: 1,
                    date: "24/05/2025",
                    time: "02:34 PM",
                    siteName: "The Rainforest",
                    incident: "Alarm activation",
                    reportedBy: "Anson",
                    image: "",
                },
            ];
            setIncidentData(dummyData);
        } catch (err) {
            toast.error("Failed to fetch incident data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full h-full">
                <h2 className="text-2xl leading-9 text-white font-noto">Incidents</h2>
                <div className="w-full flex justify-end items-end gap-4 flex-wrap lg:flex-nowrap">
                    <div className="w-[200px]">
                        <button onClick={() => setAddIncident(true)} className="font-medium text-base min-w-[200px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add Incident</button>
                    </div>
                </div>
                <div className="bg-[#252C38] p-6 rounded-lg w-full flex-1">
                    {isLoading ? (
                        <p className="text-white">Loading...</p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left text-[#98A1B3]">S. no</th>
                                        <th className="text-left text-[#98A1B3]">Date</th>
                                        <th className="text-left text-[#98A1B3]">Time</th>
                                        <th className="text-left text-[#98A1B3]">Site name</th>
                                        <th className="text-left text-[#98A1B3]">What happened</th>
                                        <th className="text-left text-[#98A1B3]">Reported by</th>
                                        <th className="text-center text-[#98A1B3]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidentData.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td className="text-white py-4">{idx + 1}</td>
                                            <td className="text-white py-4">{item.date}</td>
                                            <td className="text-white py-4">{item.time}</td>
                                            <td className="text-white py-4">{item.siteName}</td>
                                            <td className="text-white py-4">{item.incident}</td>
                                            <td className="text-white py-4">{item.reportedBy}</td>
                                            <td className="text-center py-4">
                                                {item.image ? (
                                                    <button
                                                        className="text-sm text-yellow-400 hover:underline"
                                                        onClick={() => setViewImage(item.image!)}
                                                    >
                                                        View Image
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500">No Image</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {viewImage && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <div className="flex flex-col gap-6 p-6 bg-[#252C38]">
                        <h2 className="text-2xl text-white">View Image</h2>
                        <img src={viewImage} alt="Incident" className="w-[400px] h-[300px] object-cover rounded-lg" />
                        <button
                            onClick={() => setViewImage(null)}
                            className="px-6 py-2 text-sm text-white border border-white rounded hover:bg-white hover:text-black"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default IncidentFree;

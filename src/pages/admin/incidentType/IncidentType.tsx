import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { IncidentFree } from "../../../types/incidentfree";
import { IncidentType } from "../../../types/incidentType";
import { Site } from "../../../types/site";
import MainLayout from "../../../layouts/MainLayout";
import IncidentFreeService from "../../../services/incidentFreeService";
const IncidentPage = () => {
    const [incident, setIncident] = useState<IncidentFree[]>([]);
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reportingIncident, setReportingIndcident] = useState<IncidentFree[]>([]);
    const [addData, setAddData] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [incidentDate, setIncidentDate] = useState<string>('');
    const [incidentTime, setIncidentTime] = useState<string>('');
    const [siteName, setSiteName] = useState<string>('');
    const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [whatHappened, setWhatHappened] = useState<string>('');
    const [whereHappened, setWhereHappened] = useState<string>('');
    const [whyItHappened, setWhyItHappened] = useState<string>('');
    const [personsInvolved, setPersonsInvolved] = useState<string>('');
    const [personsInjured, setPersonsInjured] = useState<string>('');
    const [incidentDetails, setIncidentDetails] = useState<string>('');
    const [opsIncharge, setOpsIncharge] = useState<string>('');
    const [reportedToManagement, setReportedToManagement] = useState<boolean>(false);
    const [reportedToPolice, setReportedToPolice] = useState<boolean>(false);
    const [propertyDamaged, setPropertyDamaged] = useState<boolean>(false);
    const [cctvImage, setCctvImage] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const { t, i18n } = useTranslation();
    const fetchIncidents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await IncidentFreeService.getIncident(token);

            if (response.success) {
                setIncident(response.data);
                const filtered = response.data.filter((emp: IncidentFree) => emp.user.id !== currentUser.id);
                setReportingIndcident(filtered);
            }
        } catch (error) {
            toast.error("Failed to load incidents");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const toBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;

            const payload = {
                happened_at: `${incidentDate}T${incidentTime}`,
                why_happened: whyItHappened,
                how_happened: "Not provided",
                persons_involved: personsInvolved,
                persons_injured: personsInjured,
                ops_incharge: opsIncharge,
                reported_to_management: reportedToManagement,
                management_report_note: "",
                reported_to_police: reportedToPolice,
                police_report_note: "",
                property_damaged: propertyDamaged,
                damage_note: "",
                cctv_image: imageBase64,
                site: { name: siteName },
                incident_type: { id: 1 },
                where_happened: whereHappened,
                incident_details: incidentDetails
            };

            const token = localStorage.getItem('token');
            const response = await IncidentFreeService.addIncident(token, payload);

            if (response.success) {
                toast.success('Incident added successfully');
                fetchIncidents();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
            setAddData(false);
            setIncidentDate('');
            setIncidentTime('');
            setSiteName('');
            setWhatHappened('');
            setWhereHappened('');
            setWhyItHappened('');
            setPersonsInvolved('');
            setPersonsInjured('');
            setIncidentDetails('');
            setOpsIncharge('');
            setReportedToManagement(false);
            setReportedToPolice(false);
            setPropertyDamaged(false);
            setCctvImage(null);
            setImageFile(null);
        }
    };
    console.log("Sites: ", sites);
console.log("IncidentTypes: ", incidentTypes);

    useEffect(() => {
        fetchIncidents();
    }, []);

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full h-full">
                <h2 className="text-2xl leading-9 text-white font-noto">{t('Incindents')}</h2>
                <div className="w-full flex justify-end items-end gap-4 flex-wrap lg:flex-nowrap">
                    <div className="w-[200px]">
                        <button
                            onClick={() => setAddData(true)}
                            className="font-medium text-base min-w-[200px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">
                            {t('Add Incindent')}
                        </button>
                    </div>
                </div>

                <div className="bg-[#252C38] p-6 rounded-lg w-full flex-1">
                    <div className="overflow-auto">
                        <table className="min-w-[800px] w-full">
                            <thead>
                                <tr>
                                    <th className="text-left text-[#98A1B3]">{t('S/NO')}</th>
                                    <th className="text-left text-[#98A1B3]">{t('Incident Date')}</th>
                                    <th className="text-left text-[#98A1B3]">{t('Incindent Time')}</th>
                                    <th className="text-left text-[#98A1B3]">{t('Site Name')}</th>
                                    <th className="text-left text-[#98A1B3]">{t('What Happened')}</th>
                                    <th className="text-left text-[#98A1B3]">{t('Reported By')}</th>
                                    <th className="text-center text-[#98A1B3]">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incident.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="text-white py-4">{idx + 1}</td>
                                        <td className="text-white py-4">{item.happened_at.split('T')[0]}</td>
                                        <td className="text-white py-4">{item.happened_at.split('T')[1].split('.')[0]}</td>
                                        <td className="text-white py-4">{item.site.name}</td>
                                        <td className="text-white py-4">{item.why_happened}</td>
                                        <td className="text-white py-4">{item.user.name}</td>
                                        <td className="text-center">

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {addData && (
                <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                        <h2 className="text-2xl leading-[36px] text-white font-noto">{t('Add Incindent')}</h2>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Select Site')}</label>
                            <select
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] outline-none"
                                value={siteName}
                                onChange={(e) => {
                                    setSiteName(e.target.value);
                                }}
                            >
                                <option value="" disabled>{t('Select Site')}</option>
                                {sites?.length > 0 && sites.map(site => (
                                    <option key={site.id} value={site.name}>{site.name}</option>
                                ))}

                            </select>
                        </div>


                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('What Happened')}</label>
                            <select
                                value={whatHappened}
                                onChange={(e) => setWhatHappened(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                required
                            >
                                <option value="">{t('Select Incident')}</option>
                                {incidentTypes.map((incidentType) => (
                                    <option key={incidentType.id} value={incidentType.name}>{incidentType.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Where It Happened')}</label>
                            <input
                                type="text"
                                value={whereHappened}
                                onChange={(e) => setWhereHappened(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Why It Happened')}</label>
                            <input
                                type="text"
                                value={whyItHappened}
                                onChange={(e) => setWhyItHappened(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Persons Involved')}</label>
                            <input
                                type="text"
                                value={personsInvolved}
                                onChange={(e) => setPersonsInvolved(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Persons Injured')}</label>
                            <input
                                type="text"
                                value={personsInjured}
                                onChange={(e) => setPersonsInjured(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Details of Incident')}</label>
                            <input
                                type="text"
                                value={incidentDetails}
                                onChange={(e) => setIncidentDetails(e.target.value)}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            />
                        </div>

                        {/* Add more fields as needed here */}
                        {/* ... */}

                        <div className="pt-3 flex gap-4 flex-wrap">
                            <button
                                type="submit"
                                className="flex justify-center items-center font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">
                                {isLoading ? "Saving..." : "Save Incident"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddData(false)}
                                className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">
                                {t('Cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </MainLayout>
    );
};

export default IncidentPage;

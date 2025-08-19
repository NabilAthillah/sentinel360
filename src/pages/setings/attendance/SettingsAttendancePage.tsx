import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import Navbar from "../../../components/Navbar";
import MainLayout from "../../../layouts/MainLayout";
import attendanceSettingService from "../../../services/attendanceSettingService";
import auditTrialsService from "../../../services/auditTrailsService";
import { RootState } from "../../../store";
import { useTranslation } from 'react-i18next';
const SettingsAttendancePage = () => {
    const [sidebar, setSidebar] = useState(false);
    const user = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState([
        {
            label: 'Grace period (in minutes)',
            placeholder: 'Grace period (in minutes)',
            value: '15'
        },
        {
            label: 'Geo fencing (in minutes)',
            placeholder: 'Geo fencing (in minutes)',
            value: '200'
        },
        {
            label: 'Day shift start time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'Day shift end time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'Night shift start time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'Night shift end time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'RELIEF Day shift start time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'RELIEF Day shift end time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'RELIEF night shift start time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'RELIEF night shift end time',
            placeholder: '00:00',
            value: '08:00'
        },
    ]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await attendanceSettingService.getAttendanceSetting(token);

            if (response.success) {
                const data = response.data;

                const mappedData = [
                    { label: 'Grace period (in minutes)', placeholder: 'Grace period (in minutes)', value: data.grace_period.toString() },
                    { label: 'Geo fencing (in meters)', placeholder: 'Geo fencing (in meters)', value: data.geo_fencing.toString() },
                    { label: 'Day shift start time', placeholder: '00:00', value: data.day_shift_start_time.slice(0, 5) },
                    { label: 'Day shift end time', placeholder: '00:00', value: data.day_shift_end_time.slice(0, 5) },
                    { label: 'Night shift start time', placeholder: '00:00', value: data.night_shift_start_time.slice(0, 5) },
                    { label: 'Night shift end time', placeholder: '00:00', value: data.night_shift_end_time.slice(0, 5) },
                    { label: 'RELIEF Day shift start time', placeholder: '00:00', value: data.relief_day_shift_start_time.slice(0, 5) },
                    { label: 'RELIEF Day shift end time', placeholder: '00:00', value: data.relief_day_shift_end_time.slice(0, 5) },
                    { label: 'RELIEF night shift start time', placeholder: '00:00', value: data.relief_night_shift_start_time.slice(0, 5) },
                    { label: 'RELIEF night shift end time', placeholder: '00:00', value: data.relief_night_shift_end_time.slice(0, 5) },
                ];

                setFormData(mappedData);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleInputChange = (index: number, newValue: string) => {
        setFormData(prev => {
            const updated = [...prev];
            updated[index].value = newValue;
            return updated;
        });
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = {
            grace_period: parseInt(formData[0].value) || 0,
            geo_fencing: parseInt(formData[1].value) || 0,
            day_shift_start_time: formData[2].value + ':00',
            day_shift_end_time: formData[3].value + ':00',
            night_shift_start_time: formData[4].value + ':00',
            night_shift_end_time: formData[5].value + ':00',
            relief_day_shift_start_time: formData[6].value + ':00',
            relief_day_shift_end_time: formData[7].value + ':00',
            relief_night_shift_start_time: formData[8].value + ':00',
            relief_night_shift_end_time: formData[9].value + ':00',
        };

        try {
            const token = localStorage.getItem('token');
            const res = await attendanceSettingService.updateAttendanceSetting(token, dataToSend);
            if (res.success) toast.success("Settings updated");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            fetchSettings();
            setLoading(false);
        }
    };

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access attendance settings page`;
            const description = `User ${user?.email} access attendance settings page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access attendance settings');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
        if (hasPermission('show_attendance_settings')) {
            fetchSettings();
        } else {
            navigate('/dashboard');
        }
    }, [])

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>{t('Settings')}</h2>
                <div className="flex flex-col gap-8 w-full h-full">
                    <Navbar />
                    <div className="bg-[#252C38] p-6 rounded-lg w-full h-full">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
                            {formData && formData.map((item, index) => (
                                <div key={index} className="flex flex-col w-full px-4 pt-2 py-2 rounded bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{item.label}</label>
                                    <input
                                        type={index <= 1 ? 'number' : 'time'}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder={item.placeholder}
                                        value={item.value}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                            {hasPermission('edit_attendance_settings') && (
                                <div className="flex gap-4 flex-wrap">
                                    <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader primary={true} /> : 'Save'}</button>
                                    {/* <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button> */}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default SettingsAttendancePage;
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AllocationDnD from '../../components/AllocationDnD';
import Loader from '../../components/Loader';
import MainLayout from '../../layouts/MainLayout';
import auditTrialsService from '../../services/auditTrailsService';
import siteService from '../../services/siteService';
import { RootState } from '../../store';
import { Site } from '../../types/site';

const AllocationPage = () => {
    const location = useLocation();
    const { pathname } = location;
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(false);

    const [allocationType, setAllocationType] = useState('bydate');
    const [shiftType, setShiftType] = useState('day');
    const [date, setDate] = useState('');

    const user = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();

    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const fetchSites = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/auth/login');
            }

            const response = await siteService.getAllSite(token);

            if (response.success) {
                setSites(response.data);
            }
        } catch (error) {
            console.error(error)
        }
    }

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    useEffect(() => {
        if (hasPermission('site_allocation')) {
            fetchSites();
        } else {
            navigate('/dashboard');
        }
    }, []);

    useEffect(() => {
        const now = new Date();

        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Singapore",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const [{ value: year }, , { value: month }, , { value: day }] = formatter.formatToParts(now);

        const formattedDate = allocationType === "bymonth"
            ? `${year}-${month}`
            : `${year}-${month}-${day}`;

        setDate(formattedDate);
    }, [allocationType]);

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access site allocation page`;
            const description = `User ${user?.email} access site allocation page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access site allocation');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
    }, [])

    return (
        <MainLayout>
            {
                loading && (
                    <div className='flex justify-center items-center w-screen h-screen fixed top-0 left-0 bg-black z-50 bg-opacity-40'>
                        <Loader primary={true} />
                    </div>
                )
            }
            <div className='flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Site Allocation</h2>
                <nav className='flex flex-wrap'>
                    {hasPermission('list_sites') && (
                        <Link to="/dashboard/sites" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                            Sites
                        </Link>
                    )}
                    {hasPermission('site_map') && (
                        <Link to="/dashboard/sites/map" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/map' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                            Map
                        </Link>
                    )}
                    <Link to="/dashboard/sites/allocation" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/allocation' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                        Allocation List
                    </Link>
                </nav>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-white'>Allocation Type</label>
                        <select
                            className="max-w-[400px] w-full h-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                            value={allocationType}
                            onChange={(e) => setAllocationType(e.target.value)}
                        >
                            <option value="bydate">By Date</option>
                            <option value="bymonth">By Month</option>
                        </select>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-white'>Date</label>
                        <input
                            type={allocationType === "bymonth" ? "month" : "date"}
                            className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-white'>Shift Type</label>
                        <select
                            className="max-w-[400px] w-full h-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                            value={shiftType}
                            onChange={(e) => setShiftType(e.target.value)}
                        >
                            <option value="day">Day Shift</option>
                            <option value="night">Night Shift</option>
                            <option value="relief day">Relief Day Shift</option>
                            <option value="relief night">Relief Night Shift</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col rounded-lg w-full h-full flex-1">
                    <AllocationDnD sites={sites} setLoading={setLoading} allocationType={allocationType} shiftType={shiftType} date={date} />
                </div>
            </div>
        </MainLayout>
    )
}

export default AllocationPage
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Map from '../../components/Map';
import MainLayout from '../../layouts/MainLayout';
import auditTrialsService from '../../services/auditTrailsService';
import siteService from '../../services/siteService';
import { RootState } from '../../store';
import { Site } from '../../types/site';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState<Site[]>([]);
    const user = useSelector((state: RootState) => state.user.user);

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

    function isToday(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();

        return (
            date.getUTCFullYear() === now.getUTCFullYear() &&
            date.getUTCMonth() === now.getUTCMonth() &&
            date.getUTCDate() === now.getUTCDate()
        );
    }

    function checkLastLogin() {
        const lastLogin = user?.last_login;
        if (lastLogin && isToday(lastLogin)) {
            const notifShown = localStorage.getItem('notif_last_login');

            if (notifShown === 'false' || !notifShown) {
                toast.warning('You must change your password every 3 months!');
                localStorage.setItem('notif_last_login', 'true');
            }
        }
    }

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access dashboard page`;
            const description = `User ${user?.email} access dashboard page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access dashboard');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
        fetchSites();
        checkLastLogin();
    }, []);

    return (
        <MainLayout>
            <div className='flex flex-col gap-10 px-6 pb-20 w-full h-[calc(100vh-91px)]'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Hello John</h2>
                <div className="flex-1">
                    <Map sites={sites} />
                    {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.22504611858!2d103.84425004999999!3d1.31400005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2sid!4v1749491915888!5m2!1sen!2sid" loading="lazy" className="w-full h-full rounded-2xl"></iframe> */}
                </div>
            </div>
        </MainLayout>
    )
}

export default DashboardPage
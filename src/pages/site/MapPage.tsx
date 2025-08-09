import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Map from '../../components/Map';
import MainLayout from '../../layouts/MainLayout';
import auditTrialsService from '../../services/auditTrailsService';
import siteService from '../../services/siteService';
import { RootState } from '../../store';
import { Site } from '../../types/site';

const MapPage = () => {
    const location = useLocation();
    const { pathname } = location;
    const [sites, setSites] = useState<Site[]>([]);

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

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access site map page`;
            const description = `User ${user?.email} access site map page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access site map');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
        if (hasPermission('site_map')) {
            fetchSites();
        } else {
            navigate('/dashboard');
        }
    }, []);

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Site Map</h2>
                <nav className='flex flex-wrap'>
                    {hasPermission('list_sites') && (
                        <Link to="/dashboard/sites" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                            Sites
                        </Link>
                    )}
                    <Link to="/dashboard/sites/map" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/map' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                        Map
                    </Link>
                    {hasPermission('site_allocation') && (
                        <Link to="/dashboard/sites/allocation" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/allocation' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                            Allocation List
                        </Link>
                    )}
                </nav>
                <div className="flex flex-col bg-[#252C38] p-4 rounded-lg w-full h-full flex-1">
                    <Map sites={sites} />
                </div>
            </div>
        </MainLayout>
    )
}

export default MapPage
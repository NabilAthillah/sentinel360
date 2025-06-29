import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Map from '../../components/Map';
import MainLayout from '../../layouts/MainLayout';
import siteService from '../../services/siteService';
import { Site } from '../../types/site';

const MapPage = () => {
    const location = useLocation();
    const { pathname } = location;
    const [sites, setSites] = useState<Site[]>([]);

    const navigate = useNavigate();

    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const fetchSites = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await siteService.getAllSite(token);

            if (response.success) {
                setSites(response.data);
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchSites();
    }, []);

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Site Map</h2>
                <nav className='flex flex-wrap'>
                    <Link to="/sites" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/sites' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                        Sites
                    </Link>
                    <Link to="/sites/map" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/sites/map' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                        Map
                    </Link>
                    <Link to="/sites/allocation" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/sites/allocation' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                        Allocation List
                    </Link>
                </nav>
                <div className="flex flex-col bg-[#252C38] p-4 rounded-lg w-full h-full flex-1">
                    <Map sites={sites} />
                </div>
            </div>
        </MainLayout>
    )
}

export default MapPage
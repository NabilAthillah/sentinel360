import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeleteModal from '../../../components/DeleteModal';
import Loader from '../../../components/Loader';
import SidebarLayout from '../../../components/SidebarLayout';
import SecondLayout from '../../../layouts/SecondLayout';
import auditTrialsService from '../../../services/auditTrailsService';
import siteService from '../../../services/siteService';
import { RootState } from '../../../store';
import { Site } from '../../../types/site';
/* ================= Helpers: Animations & Scroll Lock ================= */
function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        if (locked) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = prev || '';
        return () => {
            document.body.style.overflow = prev || '';
        };
    }, [locked]);
}

function SlideOver({
    isOpen,
    onClose,
    children,
    width = 568,
    ariaTitle,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
    ariaTitle?: string;
}) {
    const [open, setOpen] = useState(isOpen);
    useEffect(() => setOpen(isOpen), [isOpen]);
    useBodyScrollLock(open);

    // Esc close
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <AnimatePresence onExitComplete={onClose}>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    aria-hidden
                >
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaTitle}
                        className="absolute right-0 top-0 h-full w-full bg-[#252C38] shadow-xl overflow-auto"
                        style={{ maxWidth: width }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function CenterModal({
    isOpen,
    onClose,
    children,
    ariaTitle,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    ariaTitle?: string;
}) {
    const [open, setOpen] = useState(isOpen);
    useEffect(() => setOpen(isOpen), [isOpen]);
    useBodyScrollLock(open);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <AnimatePresence onExitComplete={onClose}>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaTitle}
                        className="w-[min(92vw,540px)] bg-[#252C38] rounded-2xl shadow-xl overflow-hidden"
                        initial={{ y: 20, scale: 0.98, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 12, scale: 0.98, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
/* ================= End Helpers ================= */

const SitePage = () => {
    const location = useLocation();
    const { pathname } = location;
    const [addData, setAddData] = useState(false);
    const [editData, setEditData] = useState(false);
    const [editSite, setEditSite] = useState<Site | null>(null);
    const [deleteSite, setDeleteSite] = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [sidebar, setSidebar] = useState(true);

    const [loading, setLoading] = useState(false);       // action submit/update/delete
    const [loadingList, setLoadingList] = useState(false); // fetch table

    const [sites, setSites] = useState<Site[]>([]);
    const [checkIn, setCheckIn] = useState(false);
    const [checkOut, setCheckOut] = useState(false);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const chartInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [chartName, setChartName] = useState<string | null>(null);
    const [chartFile, setChartFile] = useState<File | null>(null);
    const user = useSelector((state: RootState) => state.user.user);
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [MCSTNumber, setMCSTNumber] = useState('');
    const [ManagingAgent, setManagingAgent] = useState('');
    const [PersonInCharge, setPersonInCharge] = useState('');
    const [mobile, setMobile] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [block, setBlock] = useState('');
    const [unit, setUnit] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [lat, setLat] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [long, setLong] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(sites.length / itemsPerPage);

    const filteredSites = sites.filter(
        (site) =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.postal_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedSites = filteredSites.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const navigate = useNavigate();

    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = {
                name,
                email,
                mcst_number: MCSTNumber,
                managing_agent: ManagingAgent,
                person_in_charge: PersonInCharge,
                mobile,
                address,
                block,
                unit,
                postal_code: postalCode,
                lat,
                long,
                image: imageBase64,
                organisation_chart: chartBase64,
            };

            const token = localStorage.getItem('token');
            const response = await siteService.addSite(token, payload);

            if (response.success) {
                toast.success('Site added successfully');
                await fetchSites();
                setAddData(false);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
            setName('');
            setEmail('');
            setMCSTNumber('');
            setManagingAgent('');
            setPersonInCharge('');
            setMobile('');
            setAddress('');
            setPostalCode('');
            setLat('');
            setLong('');
            setImageFile(null);
            setImageName('');
            setChartFile(null);
            setChartName('');
        }
    };

    const handleUpdate = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = {
                name,
                email,
                mcst_number: MCSTNumber,
                managing_agent: ManagingAgent,
                person_in_charge: PersonInCharge,
                mobile,
                company_name: company,
                address,
                block,
                unit,
                postal_code: postalCode,
                lat,
                long,
                image: imageBase64,
                organisation_chart: chartBase64,
            };

            const token = localStorage.getItem('token');
            const response = await siteService.editSite(token, editSite?.id, payload);

            if (response.success) {
                toast.success('Site edited successfully');
                await fetchSites();
                setEditData(false);
                setEditSite(null);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
            setName('');
            setEmail('');
            setMCSTNumber('');
            setManagingAgent('');
            setPersonInCharge('');
            setMobile('');
            setAddress('');
            setPostalCode('');
            setLat('');
            setLong('');
            setImageFile(null);
            setImageName('');
            setChartFile(null);
            setChartName('');
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await siteService.deleteSite(token, deleteSite);

            if (response.success) {
                toast.success('Site deleted successfully');
                await fetchSites();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
            setDeleteModal(false);
            setDeleteSite('');
        }
    };

    const handleCheckIn = () => {
        console.log('✅ Checked In');
        setCheckIn(true);
    };

    const handleCheckOut = () => {
        console.log('⛔ Checked Out');
        setCheckOut(true);
    };

    const fetchSites = async () => {
        setLoadingList(true);
        try {
            const token = localStorage.getItem('token');
            const response = await siteService.getAllSite(token);

            if (response.success) {
                setSites(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingList(false);
        }
    };

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some((p) => p.name === permissionName);
    };

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access sites page`;
            const description = `User ${user?.email} access sites page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access sites');
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        audit();
        if (hasPermission('list_sites')) {
            fetchSites();
        } else {
            navigate('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (editData && editSite) {
            setName(editSite.name);
            setEmail(editSite.email || '');
            setMCSTNumber(editSite.mcst_number || '');
            setManagingAgent(editSite.managing_agent || '');
            setPersonInCharge(editSite.person_in_charge || '');
            setMobile(editSite.mobile || '');
            setAddress(editSite.address);
            setPostalCode(editSite.postal_code);
            setLat(editSite.lat);
            setLong(editSite.long);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editData]);

    return (
        <SecondLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
                <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
                <nav className="flex flex-wrap">
                    <Link
                        to="/dashboard/sites"
                        className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'
                            }`}
                    >
                        {t('Sites')}
                    </Link>
                    {hasPermission('site_map') && (
                        <Link
                            to="/dashboard/sites/map"
                            className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/map' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'
                                }`}
                        >
                            {t('Map')}
                        </Link>
                    )}
                    {hasPermission('site_allocation') && (
                        <Link
                            to="/dashboard/sites/allocation"
                            className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/sites/allocation' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'
                                }`}
                        >
                            {t('Allocation List')}
                        </Link>
                    )}
                </nav>

                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="w-full flex justify-between items-center gap-4 flex-wrap md:flex-nowrap">
                        <div className="flex items-end gap-4 w-full">
                            <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                <input
                                    type={'text'}
                                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="Search"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="button" className="p-2 rounded-[4px_4px_0px_0px]" tabIndex={-1}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32">
                                        <defs>
                                            <clipPath id="master_svg0_247_12873">
                                                <rect x="0" y="0" width="32" height="32" rx="0" />
                                            </clipPath>
                                        </defs>
                                        <g clipPath="url(#master_svg0_247_12873)">
                                            <g>
                                                <path
                                                    d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z"
                                                    fill="#98A1B3"
                                                    fillOpacity="1"
                                                />
                                            </g>
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {hasPermission('add_site') && (
                            <div className="min-w-[180px] max-w-[200px] w-fit">
                                <button
                                    onClick={() => setAddData(true)}
                                    className="font-medium text-base text-[#181d26] px-[46.5px] py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                                >
                                    {t("Add site")}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-full relative flex flex-1">
                        <div className="w-full h-fit overflow-auto pb-5 " >
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('S/NO')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Images')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Sites')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Adress')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Latittude')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Longitude')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Action')}</th>
                                    </tr>
                                </thead>

                                {loadingList ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={7} className="py-10">
                                                <div className="w-full flex justify-center">
                                                    <Loader primary />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {paginatedSites.length > 0 &&
                                            paginatedSites.map((site, index) => (
                                                <tr key={site.id ?? index}>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">{index + 1}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">
                                                        {site.image != '' && (
                                                            <img
                                                                src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'
                                                                    }storage/${site.image}`}
                                                                alt="Image"
                                                                className="h-14 w-fit"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">{site.name}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">{`${site.address}, ${site.postal_code}`}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">{site.lat}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">{site.long}</td>
                                                    <td className="pt-6 pb-3">
                                                        <div className="flex gap-6 items-center justify-center">
                                                            {hasPermission('list_site_routes') && (
                                                                <a href={`/dashboard/sites/${site.id}/routes`}>
                                                                    <svg
                                                                        className="cursor-pointer"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        version="1.1"
                                                                        width="28"
                                                                        height="28"
                                                                        viewBox="0 0 28 28"
                                                                    >
                                                                        <path
                                                                            d="M6,8L4,8L4,22C4,23.1,4.9,24,6,24L20,24L20,22L6,22L6,8ZM22,4L10,4C8.9,4,8,4.9,8,6L8,18C8,19.1,8.9,20,10,20L22,20C23.1,20,24,19.1,24,18L24,6C24,4.9,23.1,4,22,4ZM22,18L10,18L10,6L22,6L22,18ZM15,16L17,16L17,13L20,13L20,11L17,11L17,8L15,8L15,11L12,11L12,13L15,13L15,16Z"
                                                                            fill="#F4F7FF"
                                                                        />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                            {/* <svg
                                                                className="cursor-pointer"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                version="1.1"
                                                                width="28"
                                                                height="28"
                                                                viewBox="0 0 28 28"
                                                            >
                                                                <path
                                                                    d="M21.2,4L6.8,4C5.81,4,5,4.81,5,5.8V20.2C5,21.19,5.81,22,6.8,22H21.2C22.19,22,23,21.19,23,20.2V5.8C23,4.81,22.19,4,21.2,4ZM20.3,20.2H7.7C7.205,20.2,6.8,19.795,6.8,19.3V6.7C6.8,6.205,7.205,5.8,7.7,5.8H20.3C20.795,5.8,21.2,6.205,21.2,6.7V19.3C21.2,19.795,20.795,20.2,20.3,20.2ZM17.6,7.6H14.9C13.91,7.6,13.1,8.41,13.1,9.4V11.452C12.56,11.767,12.2,12.334,12.2,13C12.2,13.99,13.01,14.8,14,14.8C14.99,14.8,15.8,13.99,15.8,13C15.8,12.334,15.44,11.758,14.9,11.452V9.4H17.6V15.7C17.6,16.195,17.195,16.6,16.7,16.6H11.3C10.805,16.6,10.4,16.195,10.4,15.7V9.4H11.3C11.795,9.4,12.2,8.995,12.2,8.5C12.2,8.005,11.795,7.6,11.3,7.6H10.4C9.41,7.6,8.6,8.41,8.6,9.4V16.6C8.6,17.59,9.41,18.4,10.4,18.4H17.6C18.59,18.4,19.4,17.59,19.4,16.6V9.4C19.4,8.41,18.59,7.6,17.6,7.6Z"
                                                                    fill="#F4F7FF"
                                                                />
                                                            </svg> */}
                                                            {hasPermission('edit_site') && (
                                                                <svg
                                                                    onClick={() => {
                                                                        setEditSite(site);
                                                                        setEditData(true);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    version="1.1"
                                                                    width="28"
                                                                    height="28"
                                                                    viewBox="0 0 28 28"
                                                                >
                                                                    <path
                                                                        d="M3.5,20.1249V24.5H7.875L20.7783,11.5967L16.4033,7.2217L3.5,20.1249ZM24.1617,8.2133C24.6166,7.7593,24.6166,7.0223,24.1617,6.5683L21.4317,3.8383C20.9777,3.3834,20.2406,3.3834,19.7867,3.8383L17.6517,5.9733L22.0267,10.3483L24.1617,8.2133Z"
                                                                        fill="#F4F7FF"
                                                                    />
                                                                </svg>
                                                            )}
                                                            {hasPermission('delete_site') && (
                                                                <svg
                                                                    onClick={() => {
                                                                        setDeleteSite(site.id);
                                                                        setDeleteModal(true);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    version="1.1"
                                                                    width="28"
                                                                    height="28"
                                                                    viewBox="0 0 28 28"
                                                                >
                                                                    <path
                                                                        d="M6.9997,24.5H21.0V8.16667H7.0V24.5ZM22.1663,4.66667H18.083L16.9163,3.5H11.083L9.91634,4.66667H5.83301V7H22.1663V4.66667Z"
                                                                        fill="#F4F7FF"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {sites.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center text-white py-6">
                                                    {t('No sites found.')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 text-[#F4F7FF]">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                        >
                            {t('Prev')}
                        </button>
                        <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                            {currentPage}
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                        >
                            {t('Next')}
                        </button>
                    </div>
                </div>
            </div>

            <SlideOver isOpen={editData && !!editSite} onClose={() => { setEditData(false); setEditSite(null); }} ariaTitle="Edit site" width={568}>
                {editData && editSite && (
                    <form onSubmit={handleUpdate} className="flex flex-col gap-6 p-6 max-h-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl leading-[36px] text-white font-noto">{t('Edit site')}</h2>
                            <button
                                type="button"
                                onClick={() => { setEditData(false); setEditSite(null); }}
                                className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Site')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Site"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Address')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Postal Code')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Postal Code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Email')}</label>
                            <input
                                type="email"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Mobile')}</label>
                            <PhoneInput
                                country={'sg'}
                                value={mobile}
                                enableLongNumbers={true}
                                onChange={(phone) => {
                                    const onlyNumbers = phone.replace(/\s/g, '');
                                    const withPlus = `+${onlyNumbers}`;
                                    setMobile(withPlus);
                                }}
                                inputProps={{ inputMode: 'tel' }}
                                inputStyle={{ backgroundColor: '#222834', color: '#F4F7FF', border: 'none', width: '100%' }}
                                buttonStyle={{ backgroundColor: '#222834', border: 'none' }}
                                containerStyle={{ backgroundColor: '#222834' }}
                                dropdownStyle={{ backgroundColor: '#2f3644', color: '#fff' }}
                                placeholder="Mobile"
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('MSCT number')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="MCST Number"
                                value={MCSTNumber}
                                onChange={(e) => setMCSTNumber(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Managing Agent')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Managing Agent"
                                value={ManagingAgent}
                                onChange={(e) => setManagingAgent(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Person In Charge')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Person In Charge"
                                value={PersonInCharge}
                                onChange={(e) => setPersonInCharge(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                <label className="text-xs text-[#98A1B3]">{t('Latitude')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                    placeholder="Latitude"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                <label className="text-xs text-[#98A1B3]">{t('Longitude')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                    placeholder="Longitude"
                                    value={long}
                                    onChange={(e) => setLong(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs text-[#98A1B3]">
                                {t('Site image')} <span className="text-xs">{t('Maximum image size is 5MB'!)}</span>{' '}
                                <span className="text-red-500 text-[10px]">* {t('Do not upload if you dont want to make changes')}</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38]"
                                >
                                    Upload file
                                </button>
                                {imageName && <span className="text-sm text-[#98A1B3]">{imageName}</span>}
                            </div>
                            {editSite.image != '' && (
                                <img
                                    src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${editSite?.image}`}
                                    alt="Image"
                                    className="h-14 w-fit"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={imageInputRef}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const maxSizeInBytes = 5 * 1024 * 1024;
                                        if (file.size > maxSizeInBytes) {
                                            toast.warning(t<string>('Maximum file size is 5MB!'));
                                            e.target.value = '';
                                            return;
                                        }
                                        setImageName(file.name);
                                        setImageFile(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs text-[#98A1B3]">
                                {t('Organisation chart')}<span className="text-xs">{t('Maximum image size is 5MB'!)}</span>{' '}
                                <span className="text-red-500 text-[10px]">* {t('Do not upload if you dont want to make changes')}</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => chartInputRef.current?.click()}
                                    className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38]"
                                >
                                    {t('Upload File')}
                                </button>
                                {chartName && <span className="text-sm text-[#98A1B3]">{chartName}</span>}
                            </div>
                            {editSite.organisation_chart != '' && (
                                <img
                                    src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'
                                        }storage/${editSite?.organisation_chart}`}
                                    alt="Image"
                                    className="h-14 w-fit"
                                />
                            )}
                            <input
                                type="file"
                                ref={chartInputRef}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const maxSizeInBytes = 5 * 1024 * 1024;
                                        if (file.size > maxSizeInBytes) {
                                            toast.warning(t<string>('Maximum file size is 5MB!'));
                                            e.target.value = '';
                                            return;
                                        }
                                        setChartName(file.name);
                                        setChartFile(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            <button
                                type="submit"
                                className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                            >
                                {loading ? <Loader primary /> : t('Save')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditData(false);
                                    setEditSite(null);
                                }}
                                className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </SlideOver>

            {/* ADD SLIDE-OVER */}
            <SlideOver isOpen={addData} onClose={() => setAddData(false)} ariaTitle="Add site" width={568}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-h-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl leading-[36px] text-white font-noto">{t('Add Site')}</h2>
                        <button
                            type="button"
                            onClick={() => setAddData(false)}
                            className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* --- original add form fields --- */}
                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Site')}</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Site"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Address')}</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Address"
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Postal Code')}</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Postal Code"
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Email')}</label>
                        <input
                            type="email"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Mobile')}</label>
                        <PhoneInput
                            country={'sg'}
                            enableLongNumbers={true}
                            onChange={(phone) => {
                                const onlyNumbers = phone.replace(/\s/g, '');
                                const withPlus = `+${onlyNumbers}`;
                                setMobile(withPlus);
                            }}
                            inputProps={{ inputMode: 'tel' }}
                            inputStyle={{ backgroundColor: '#222834', color: '#F4F7FF', border: 'none', width: '100%' }}
                            buttonStyle={{ backgroundColor: '#222834', border: 'none' }}
                            containerStyle={{ backgroundColor: '#222834' }}
                            dropdownStyle={{ backgroundColor: '#2f3644', color: '#fff' }}
                            placeholder="Mobile"
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('MSCT Number')}r</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="MCST Number"
                            onChange={(e) => setMCSTNumber(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Managing Agent')}</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Managing Agent"
                            onChange={(e) => setManagingAgent(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                        <label className="text-xs text-[#98A1B3]">{t('Person In Charge')}</label>
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                            placeholder="Person In Charge"
                            onChange={(e) => setPersonInCharge(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Latitude')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Latitude"
                                onChange={(e) => setLat(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Longitude')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base"
                                placeholder="Longitude"
                                onChange={(e) => setLong(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs text-[#98A1B3]">
                            {t('Site Image')} <span className="text-xs">{t('Maximum image size is 5MB'!)}</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38]"
                            >
                                {t('Upload file')}
                            </button>
                            {imageName && <span className="text-sm text-[#98A1B3]">{imageName}</span>}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const maxSizeInBytes = 5 * 1024 * 1024;
                                    if (file.size > maxSizeInBytes) {
                                        toast.warning(t<string>('Maximum file size is 5MB!'));
                                        e.target.value = '';
                                        return;
                                    }
                                    setImageName(file.name);
                                    setImageFile(file);
                                }
                            }}
                            className="hidden"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs text-[#98A1B3]">
                            {t('Organisation chart')} <span className="text-xs">{t('Maximum image size is 5MB'!)}</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => chartInputRef.current?.click()}
                                className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38]"
                            >
                                {t('Upload file')}
                            </button>
                            {chartName && <span className="text-sm text-[#98A1B3]">{chartName}</span>}
                        </div>
                        <input
                            type="file"
                            ref={chartInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const maxSizeInBytes = 5 * 1024 * 1024;
                                    if (file.size > maxSizeInBytes) {
                                        toast.warning(t<string>('Maximum file size is 5MB!'));
                                        e.target.value = '';
                                        return;
                                    }
                                    setChartName(file.name);
                                    setChartFile(file);
                                }
                            }}
                            className="hidden"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <button
                            type="submit"
                            className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                        >
                            {loading ? <Loader primary /> : t('Save')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddData(false)}
                            className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                </form>
            </SlideOver>

            {/* DELETE MODAL (animated) */}
            <CenterModal
                isOpen={deleteModal}
                onClose={() => {
                    setDeleteModal(false);
                    setDeleteSite('');
                }}
                ariaTitle="Delete site"
            >
                <div className="p-6">
                    <DeleteModal loading={loading} setModal={setDeleteModal} handleDelete={handleDelete} />
                </div>
            </CenterModal>
        </SecondLayout>
    );
};

export default SitePage;

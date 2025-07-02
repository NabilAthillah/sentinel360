import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeleteModal from '../../components/DeleteModal';
import Loader from '../../components/Loader';
import MainLayout from '../../layouts/MainLayout';
import siteService from '../../services/siteService';
import { Site } from '../../types/site';

const SitePage = () => {
    const location = useLocation();
    const { pathname } = location;
    const [addData, setAddData] = useState(false);
    const [editData, setEditData] = useState(false);
    const [editSite, setEditSite] = useState<Site | null>(null);
    const [deleteSite, setDeleteSite] = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState<Site[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSites, setFilteredSites] = useState<Site[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = (searchTerm ? filteredSites : sites).slice(indexOfFirstItem, indexOfLastItem);

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const chartInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [chartName, setChartName] = useState<string | null>(null);
    const [chartFile, setChartFile] = useState<File | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [MCSTNumber, setMCSTNumber] = useState('');
    const [MAName, setMAName] = useState('');
    const [mobile, setMobile] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [block, setBlock] = useState('');
    const [unit, setUnit] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');

    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const totalItems = searchTerm ? filteredSites.length : sites.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const toBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = {
                name,
                email,
                mcst_number: MCSTNumber,
                ma_name: MAName,
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
            const response = await siteService.addSite(token, payload);

            if (response.success) {
                toast.success('Site added successfully');
                fetchSites();
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false);
            setAddData(false);
            setName('');
            setEmail('');
            setMCSTNumber('');
            setMAName('');
            setMobile('');
            setCompany('');
            setAddress('');
            setBlock('');
            setUnit('');
            setPostalCode('');
            setLat('');
            setLong('');
            setImageFile(null);
            setImageName('');
            setChartFile(null);
            setChartName('');
        }
    }

    const handleUpdate = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const toBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = {
                name,
                email,
                mcst_number: MCSTNumber,
                ma_name: MAName,
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
                fetchSites();
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false);
            setEditData(false);
            setName('');
            setEmail('');
            setMCSTNumber('');
            setMAName('');
            setMobile('');
            setCompany('');
            setAddress('');
            setBlock('');
            setUnit('');
            setPostalCode('');
            setLat('');
            setLong('');
            setImageFile(null);
            setImageName('');
            setChartFile(null);
            setChartName('');
        }
    }

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await siteService.deleteSite(token, deleteSite);

            if (response.success) {
                toast.success('Site deleted successfully');
                fetchSites();
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeleteModal(false);
            setDeleteSite('');
        }
    }

    const handleSearch = () => {
        const filtered = sites.filter((site) =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSites(filtered);
    };

    const fetchSites = async () => {
        try {
            const token = localStorage.getItem('token');
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

    useEffect(() => {
        if (editData && editSite) {
            setName(editSite.name);
            setEmail(editSite.email || '');
            setMCSTNumber(editSite.mcst_number || '');
            setMAName(editSite.ma_name || '');
            setMobile(editSite.mobile || '');
            setCompany(editSite.company_name || '');
            setAddress(editSite.address);
            setBlock(editSite.block || '');
            setUnit(editSite.unit || '');
            setPostalCode(editSite.postal_code);
            setLat(editSite.lat);
            setLong(editSite.long);
        }
    }, [editData])

    useEffect(() => {
        const filtered = sites.filter((site) =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSites(filtered);
    }, [searchTerm, sites]);

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Sites</h2>
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
                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="w-full flex justify-between items-center gap-4 flex-wrap md:flex-nowrap">
                        <div className="flex items-end gap-4 w-full">
                            <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                <input
                                    type={"text"}
                                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                />
                                <button
                                    type="button"
                                    className="p-2 rounded-[4px_4px_0px_0px]"
                                    tabIndex={-1}
                                    onClick={handleSearch}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                                </button>
                            </div>
                        </div>
                        <div className="min-w-[180px] max-w-[200px] w-fit">
                            <button onClick={() => setAddData(true)} className="font-medium text-base text-[#181d26] px-[46.5px] py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add site</button>
                        </div>
                    </div>
                        <div className="w-full h-full relative flex flex-1 pb-10">
                            <div className="w-full h-fit overflow-auto pb-5 flex-1">
                                <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">S. no</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Image</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Site name</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Address</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Latitude</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Longitude</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((site, index) => (
                                        <tr key={site.id}>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{indexOfFirstItem + index + 1}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">
                                                {site.image !== '' && (
                                                    <img
                                                        src={`${baseURL.toString() !== '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${site.image}`}
                                                        alt="Image"
                                                        className="h-14 w-fit"
                                                    />
                                                )}
                                            </td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{site.name}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{`${site.address}, ${site.postal_code}`}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{site.lat}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{site.long}</td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <a href={`/sites/${site.id}/routes`}>
                                                        <svg className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_354_12307"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_354_12307)"><g><path d="M6,8L4,8L4,22C4,23.1,4.9,24,6,24L20,24L20,22L6,22L6,8ZM22,4L10,4C8.9,4,8,4.9,8,6L8,18C8,19.1,8.9,20,10,20L22,20C23.1,20,24,19.1,24,18L24,6C24,4.9,23.1,4,22,4ZM22,18L10,18L10,6L22,6L22,18ZM15,16L17,16L17,13L20,13L20,11L17,11L17,8L15,8L15,11L12,11L12,13L15,13L15,16Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    </a>
                                                    <svg className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_354_13168"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_354_13168)"><g><path d="M21.2,4L6.8,4C5.8100000000000005,4,5,4.8100000000000005,5,5.8L5,20.2C5,21.19,5.8100000000000005,22,6.8,22L21.2,22C22.19,22,23,21.19,23,20.2L23,5.8C23,4.8100000000000005,22.19,4,21.2,4ZM20.3,20.2L7.7,20.2C7.205,20.2,6.8,19.795,6.8,19.3L6.8,6.7C6.8,6.205,7.205,5.8,7.7,5.8L20.3,5.8C20.795,5.8,21.2,6.205,21.2,6.7L21.2,19.3C21.2,19.795,20.795,20.2,20.3,20.2ZM17.6,7.6L14.9,7.6C13.91,7.6,13.1,8.41,13.1,9.4L13.1,11.452C12.559999999999999,11.767,12.2,12.334,12.2,13C12.2,13.99,13.01,14.8,14,14.8C14.99,14.8,15.8,13.99,15.8,13C15.8,12.334,15.44,11.758,14.9,11.452L14.9,9.4L17.6,9.4L17.6,15.7C17.6,16.195,17.195,16.6,16.7,16.6L11.3,16.6C10.805,16.6,10.4,16.195,10.4,15.7L10.4,9.4L11.3,9.4C11.795,9.4,12.2,8.995000000000001,12.2,8.5C12.2,8.004999999999999,11.795,7.6,11.3,7.6L10.4,7.6C9.41,7.6,8.6,8.41,8.6,9.4L8.6,16.6C8.6,17.59,9.41,18.4,10.4,18.4L17.6,18.4C18.59,18.4,19.4,17.59,19.4,16.6L19.4,9.4C19.4,8.41,18.59,7.6,17.6,7.6Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg onClick={() => { setEditSite(site); setEditData(true) }} className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg onClick={() => { setDeleteSite(site.id); setDeleteModal(true) }} className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                            <button
                                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">{currentPage}</button>
                            <button
                                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {
                editData && editSite && (
                    <form onSubmit={handleUpdate} className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Edit site</h2>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Site name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Site name'
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                <input
                                    type={"email"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Mobile'
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">MCST number</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='MCST Number'
                                    value={MCSTNumber}
                                    onChange={(e) => setMCSTNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">MA name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='MA name'
                                    value={MAName}
                                    onChange={(e) => setMAName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Company Name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Company Name'
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Address</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Address'
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Postal Code</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Postal Code'
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Block</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Block'
                                        value={block}
                                        onChange={(e) => setBlock(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Unit</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Unit'
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Latitude</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Latitude'
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Longitude</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Longitude'
                                        value={long}
                                        onChange={(e) => setLong(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Site image <span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span></label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        Upload file
                                    </button>
                                    {imageName && (
                                        <span className="text-sm text-[#98A1B3]">{imageName}</span>
                                    )}
                                </div>
                                {editSite.image != '' && (
                                    <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${editSite?.image}`} alt="Image" className='h-14 w-fit' />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        console.log("Selected image file:", file);
                                        if (file) {
                                            setImageName(file.name);
                                            setImageFile(file)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Organisation chart <span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span></label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => chartInputRef.current?.click()}
                                        className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        Upload file
                                    </button>
                                    {chartName && (
                                        <span className="text-sm text-[#98A1B3]">{chartName}</span>
                                    )}
                                </div>
                                {editSite.organisation_chart != '' && (
                                    <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${editSite?.organisation_chart}`} alt="Image" className='h-14 w-fit' />
                                )}
                                <input
                                    type="file"
                                    ref={chartInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        console.log("Selected image file:", file);
                                        if (file) {
                                            setChartName(file.name);
                                            setChartFile(file)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button type='submit' className="flex justify-center items-center font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                                <p onClick={() => { setEditData(false); setEditSite(null) }} className="cursor-pointer font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</p>
                            </div>
                        </div>
                    </form>
                )
            }
            {
                addData && (
                    <form onSubmit={handleSubmit} className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Add site</h2>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Site name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Site name'
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                <input
                                    type={"email"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Email'
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Mobile'
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">MCST number</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='MCST Number'
                                    onChange={(e) => setMCSTNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">MA name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='MA name'
                                    onChange={(e) => setMAName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Company Name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Company Name'
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Address</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Address'
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Postal Code</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Postal Code'
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Block</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Block'
                                        onChange={(e) => setBlock(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Unit</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Unit'
                                        onChange={(e) => setUnit(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Latitude</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Latitude'
                                        onChange={(e) => setLat(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Longitude</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Longitude'
                                        onChange={(e) => setLong(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Site image</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        Upload file
                                    </button>
                                    {imageName && (
                                        <span className="text-sm text-[#98A1B3]">{imageName}</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        console.log("Selected image file:", file);
                                        if (file) {
                                            setImageName(file.name);
                                            setImageFile(file)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Organisation chart</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => chartInputRef.current?.click()}
                                        className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        Upload file
                                    </button>
                                    {chartName && (
                                        <span className="text-sm text-[#98A1B3]">{chartName}</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={chartInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        console.log("Selected image file:", file);
                                        if (file) {
                                            setChartName(file.name);
                                            setChartFile(file)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button type='submit' className="flex justify-center items-center font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                                <p onClick={() => setAddData(false)} className="cursor-pointer font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</p>
                            </div>
                        </div>
                    </form>
                )
            }
            {deleteModal && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <DeleteModal setModal={setDeleteModal} handleDelete={handleDelete} />
                </div>
            )}
        </MainLayout>
    )
}

export default SitePage
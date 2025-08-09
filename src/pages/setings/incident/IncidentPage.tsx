import { Switch } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import Navbar from "../../../components/Navbar";
import MainLayout from "../../../layouts/MainLayout";
import auditTrialsService from "../../../services/auditTrailsService";
import IncidentTypesService from "../../../services/incidentTypeService";
import { RootState } from "../../../store";
import { IncidentType } from "../../../types/incidentType";
const IncidentPageMaster = () => {
    const [sidebar, setSidebar] = useState(false);
    const [data1, setData1] = useState(true);
    const [data2, setData2] = useState(false);
    const [addIncident, setAddIncident] = useState(false);
    const [editIncident, setEditIncident] = useState(false);
    const [editData, setEditData] = useState<IncidentType | null>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [datas, setDatas] = useState<IncidentType[]>([]);
    const [name, setName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const user = useSelector((state: RootState) => state.user.user);
    const filteredData = datas.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSortByStatus = () => {
        const sortedData = [...datas].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.status.localeCompare(b.status);
            } else {
                return b.status.localeCompare(a.status);
            }
        });

        setDatas(sortedData);
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const fetchIncidentTypes = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/auth/login');
            }

            const response = await IncidentTypesService.getIncidentTypes(token);

            if (response.success) {
                setDatas(response.data)
            }
        } catch (error: any) {
            console.error(error.message)
        }
    }
    const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
        datas?.reduce((acc, catg) => {
            acc[catg.id] = catg.status === 'active';
            return acc;
        }, {} as Record<string, boolean>) ?? {}
    );

    const handleToggle = async (id: string) => {
        const prevStatus = switchStates[id];
        const newStatus = !prevStatus;

        setSwitchStates((prev) => ({
            ...prev,
            [id]: newStatus,
        }));

        const token = localStorage.getItem('token');

        if (!token) {
            localStorage.clear();
            navigate('/auth/login');
        }

        try {
            const response = await IncidentTypesService.editIncidentTypesStatus(token, id, newStatus ? 'active' : 'deactive');

            if (response.success) {
                toast.success('Incident status updated successfully');
                fetchIncidentTypes();
            }
        } catch (error) {
            console.error();
            setSwitchStates((prev) => ({
                ...prev,
                [id]: prevStatus,
            }));

            toast.error('Failed to update Incident status');
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/auth/login');
            }

            const response = await IncidentTypesService.addIncidentTypes(token, name);

            if (response.success) {
                toast.success('Incident created successfully');

                fetchIncidentTypes();
                setLoading(false);
                setAddIncident(false);
                setName('');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const handleEdit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/auth/login');
            }

            const response = await IncidentTypesService.editIncidentTypes(token, editData?.id, name);

            if (response.success) {
                toast.success('Incident updated successfully');

                fetchIncidentTypes();
                setLoading(false);
                setEditData(null);
                setName('');
                setEditIncident(false);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access incident settings page`;
            const description = `User ${user?.email} access incident settings page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access incident');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
        if (hasPermission('list_incident_types')) {
            fetchIncidentTypes();
        } else {
            navigate('/dashboard');
        }
    }, []);

    useEffect(() => {
        if (datas) {
            const newSwitchStates = datas.reduce((acc, catg) => {
                acc[catg.id] = catg.status === 'active';
                return acc;
            }, {} as Record<string, boolean>);

            setSwitchStates(newSwitchStates);
        }
    }, [datas]);

    useEffect(() => {
        if (editData && editIncident) {
            setName(editData.name)
        }
    }, [editIncident]);

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Settings</h2>
                <div className="flex flex-col gap-8 w-full h-full flex-1">
                    <Navbar />
                    <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                        <div className="w-full flex justify-between items-center gap-4 flex-wrap lg:flex-nowrap">
                            <div className="flex items-end gap-4 w-full">
                                <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                    <input
                                        type={"text"}
                                        className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="p-2 rounded-[4px_4px_0px_0px]"
                                        tabIndex={-1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                                    </button>
                                </div>
                            </div>
                            {hasPermission('add_incident_type') && (
                                <div className="w-[200px]">
                                    <button onClick={() => setAddIncident(true)} className="font-medium text-base min-w-[200px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add Incident</button>
                                </div>
                            )}
                        </div>
                        <div className="w-full h-full relative pb-10 flex flex-1">
                            <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                                <table className="min-w-[700px] w-full">
                                    <thead>
                                        <tr>
                                            <th className="font-semibold text-[#98A1B3] text-start">S/NO</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Incident</th>
                                            <th className="font-semibold text-[#98A1B3] text-start flex items-center gap-2 cursor-pointer" onClick={handleSortByStatus}>Status <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="14.689416885375977" height="20.504201889038086" viewBox="0 0 14.689416885375977 20.504201889038086"><g><path d="M12.0068,16.103L12.0068,9.09128C12.0068,8.44962,11.4818,7.92462,10.8401,7.92462C10.1985,7.92462,9.67346,8.44962,9.67346,9.09128L9.67346,16.103L7.58512,16.103C7.06012,16.103,6.80346,16.733,7.17679,17.0946L10.4318,20.338C10.6651,20.5596,11.0268,20.5596,11.2601,20.338L14.5151,17.0946C14.8885,16.733,14.6201,16.103,14.1068,16.103L12.0068,16.103ZM3.43179,0.166284L0.17679,3.42128C-0.196543,3.78295,0.0601238,4.41295,0.585124,4.41295L2.67346,4.41295L2.67346,11.4246C2.67346,12.0663,3.19846,12.5913,3.84012,12.5913C4.48179,12.5913,5.00679,12.0663,5.00679,11.4246L5.00679,4.41295L7.09512,4.41295C7.62012,4.41295,7.87679,3.78295,7.50346,3.42128L4.24846,0.166284C4.02138,-0.0554282,3.65887,-0.0554282,3.43179,0.166284Z" fill="#98A1B3" fill-opacity="1" /></g></svg></th>
                                            <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((incident, index) => (
                                                <tr key={incident.id}>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">
                                                        {incident.name}
                                                    </td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">
                                                        {hasPermission('add_incident_type') ? (
                                                            <div className="flex items-center gap-4 w-40">
                                                                <Switch
                                                                    id={`custom-switch-component-${incident.id}`}
                                                                    ripple={false}
                                                                    checked={switchStates[incident.id]}
                                                                    onChange={(e) => handleToggle(incident.id)}
                                                                    className="h-full w-full checked:bg-[#446FC7]"
                                                                    containerProps={{
                                                                        className: "w-11 h-6",
                                                                    }}
                                                                    circleProps={{
                                                                        className: "before:hidden left-0.5 border-none",
                                                                    }} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
                                                                <p className={`font-medium text-sm capitalize ${switchStates[incident.id] ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>
                                                                    {switchStates[incident.id] ? 'active' : 'inactive'}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className={`font-medium text-sm capitalize ${switchStates[incident.id] ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>
                                                                {switchStates[incident.id] ? 'active' : 'inactive'}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="pt-6 pb-3">
                                                        {hasPermission('edit_incident_type') && (
                                                            <div className="flex gap-6 items-center justify-center">
                                                                <svg
                                                                    onClick={() => {
                                                                        setEditIncident(true);
                                                                        setEditData(incident);
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
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center text-white py-4">
                                                    No documents found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                                <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                        className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]"
                                    >
                                        {currentPage}
                                    </button>
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {editIncident && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <form onSubmit={handleEdit} className="flex flex-col gap-6 p-6 bg-[#252C38]">
                        <h2 className='text-2xl leading-[36px] text-white font-noto'>Edit Incident</h2>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Incident name</label>
                            <input
                                type={"text"}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder='Incident name'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                            <button onClick={() => { setEditIncident(false); setLoading(false); setEditData(null) }} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            {addIncident && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-[#252C38]">
                        <h2 className='text-2xl leading-[36px] text-white font-noto'>Add Incident</h2>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Incident name</label>
                            <input
                                type={"text"}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder='Incident name'
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Submit'}</button>
                            <button onClick={() => setAddIncident(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </MainLayout>
    )
}

export default IncidentPageMaster;
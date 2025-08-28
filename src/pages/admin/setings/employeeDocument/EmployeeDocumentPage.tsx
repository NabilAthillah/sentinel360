import { Switch } from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader";
import Navbar from "../../../../components/Navbar";
import MainLayout from "../../../../layouts/MainLayout";
import auditTrailsService from "../../../../services/auditTrailsService";
import employeeDocumentService from "../../../../services/employeeDocumentService";
import { RootState } from "../../../../store";
import { EmployeeDocument } from "../../../../types/employeeDocument";

const EmployeeDocumentPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const token = useSelector((state: RootState) => state.token.token);

    const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(false);

    const [addDocumentOpen, setAddDocumentOpen] = useState(false);
    const [editDocumentOpen, setEditDocumentOpen] = useState(false);
    const [editDocumentData, setEditDocumentData] = useState<EmployeeDocument | null>(null);
    const [documentName, setDocumentName] = useState('');
    const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!token) navigate('/auth/login');
        if (!user?.role?.permissions?.some(p => p.name === 'list_employee_documents')) navigate('/dashboard');
        auditAccess();
    }, [token, user]);


    useEffect(() => {
        if (employeeDocuments) {
            const newStates = employeeDocuments.reduce((acc, doc) => {
                acc[doc.id] = doc.status === 'active';
                return acc;
            }, {} as Record<string, boolean>);
            setSwitchStates(newStates);
        }
    }, [employeeDocuments]);

    useEffect(() => {
        if (editDocumentData && editDocumentOpen) {
            setDocumentName(editDocumentData.name);
        }
    }, [editDocumentOpen, editDocumentData]);

    useEffect(() => {
        if (token) fetchEmployeeDocuments();
    }, [token]);

    const auditAccess = async () => {
        try {
            await auditTrailsService.storeAuditTrails({
                token,
                userId: user?.id,
                title: 'Access employee document settings',
                description: `User ${user?.email} accessed employee document settings`,
                status: 'success',
                module: 'employee document',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployeeDocuments = async () => {
        setLoading(true);
        try {
            const response = await employeeDocumentService.getEmployeeDocuments({ token });
            setEmployeeDocuments(response.data || []);
            // console.log(response.data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        const prev = switchStates[id];
        const newStatus = !prev;
        setSwitchStates(prevState => ({ ...prevState, [id]: newStatus }));

        try {
            await employeeDocumentService.editEmployeeDocumentStatus(token, id, newStatus ? 'active' : 'deactive');
            toast.success('Status updated successfully');
            fetchEmployeeDocuments();
        } catch (error) {
            setSwitchStates(prevState => ({ ...prevState, [id]: prev }));
            toast.error('Failed to update status');
        }
    };

    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await employeeDocumentService.addEmployeeDocument(token, documentName);
            toast.success('Document created successfully');
            setAddDocumentOpen(false);
            setDocumentName('');

            fetchEmployeeDocuments();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create document');
        } finally {
            setLoading(false);
        }
    };


    const handleEditDocument = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!editDocumentData) return;
            await employeeDocumentService.editEmployeeDocument(token, editDocumentData.id, documentName);
            toast.success('Document updated successfully');
            setEditDocumentOpen(false);
            setEditDocumentData(null);
            setDocumentName('');
            fetchEmployeeDocuments();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = employeeDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSortByStatus = () => {
        const sorted = [...employeeDocuments].sort((a, b) =>
            sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
        );
        setEmployeeDocuments(sorted);
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-4 px-6 pb-20 w-full h-full flex-1">
                <h2 className="text-2xl leading-9 text-white font-noto">{t('Settings')}</h2>
                <div className="flex flex-col gap-8 w-full h-full flex-1">
                    <Navbar />
                    <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="flex items-center gap-4 w-full md:max-w-[400px] bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-t">
                                <input
                                    type="text"
                                    className="w-full px-4 pt-2 pb-2 bg-[#222834] text-[#F4F7FF] placeholder:text-[#98A1B3] rounded-t focus:outline-none"
                                    placeholder={t('Search')}
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                                <button
                                    type="button"
                                    className="p-2 rounded-[4px_4px_0px_0px]"
                                    tabIndex={-1}
                                    
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        version="1.1"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 32 32"
                                    >
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
                            {user?.role?.permissions?.some(p => p.name === 'add_employee_document') && (
                                <button
                                    onClick={() => setAddDocumentOpen(true)}
                                    className="font-medium text-base text-[#181D26] px-6 py-2 border border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition"
                                >
                                    {t('Add document')}
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="relative w-full overflow-auto flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="text-[#98A1B3] text-start">{t('S/NO')}</th>
                                        <th className="text-[#98A1B3] text-start">{t('Document')}</th>
                                        <th className="text-[#98A1B3] text-start flex items-center gap-2 cursor-pointer" onClick={handleSortByStatus}>
                                            {t('Status')}
                                        </th>
                                        <th className="text-[#98A1B3] text-center">{t('Action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center">
                                                <Loader primary />
                                            </td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((doc, index) => (
                                            <tr key={doc.id}>
                                                {/* Nomor */}
                                                <td className="text-[#F4F7FF] pt-4 pb-2">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>

                                                {/* Nama Document */}
                                                <td className="text-[#F4F7FF] pt-4 pb-2">{doc.name}</td>

                                                {/* Status Switch */}
                                                <td className="text-[#F4F7FF] pt-4 pb-2">
                                                    <div className="flex items-center gap-4 w-40">
                                                        <Switch
                                                            id={`custom-switch-component-${doc.id}`}
                                                            ripple={false}
                                                            checked={switchStates[doc.id]}
                                                            onChange={() => handleToggleStatus(doc.id)}
                                                            className="h-full w-full checked:bg-[#446FC7]"
                                                            containerProps={{ className: "w-11 h-6" }}
                                                            circleProps={{ className: "before:hidden left-0.5 border-none" }}
                                                            onResize={undefined}
                                                            onResizeCapture={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                            crossOrigin={undefined}
                                                        />
                                                        <span
                                                            className={`font-medium text-sm capitalize ${doc.status === "active"
                                                                ? "text-[#19CE74]"
                                                                : "text-[#FF7E6A]"
                                                                }`}
                                                        >
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Action Edit */}
                                                <td className="text-[#F4F7FF] pt-4 pb-2 items-center justify-center flex">
                                                    {user?.role?.permissions?.some(p => p.name === 'edit_employee_document') && (
                                                        <svg
                                                            onClick={() => {
                                                                setEditDocumentData(doc);
                                                                setEditDocumentOpen(true);
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
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center text-[#F4F7FF]">
                                                {t('No data')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

                <AnimatePresence>
                    {addDocumentOpen && (
                        <motion.div
                            key="add-overlay"
                            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAddDocumentOpen(false)}
                        >
                            <motion.form
                                onSubmit={handleCreateDocument}
                                className="flex flex-col gap-6 p-6 bg-[#252C38] rounded-2xl shadow-xl w-[min(92vw,520px)]"
                                initial={{ y: 20, scale: 0.98, opacity: 0 }}
                                animate={{ y: 0, scale: 1, opacity: 1 }}
                                exit={{ y: 12, scale: 0.98, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl leading-[36px] text-white font-noto">
                                    {t('Add Document')}
                                </h2>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">
                                        {t('Document Name')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder={t('Document Name')}
                                        value={documentName}
                                        onChange={e => setDocumentName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 justify-end flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => setAddDocumentOpen(false)}
                                        className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38] transition"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition"
                                    >
                                        {loading ? <Loader primary /> : t('Save')}
                                    </button>
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editDocumentOpen && editDocumentData && (
                        <motion.div
                            key="edit-overlay"
                            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setEditDocumentOpen(false);
                                setDocumentName('');
                                setEditDocumentData(null);
                            }}
                        >
                            <motion.form
                                onSubmit={handleEditDocument}
                                className="flex flex-col gap-6 p-6 bg-[#252C38] rounded-2xl shadow-xl w-[min(92vw,520px)]"
                                initial={{ y: 20, scale: 0.98, opacity: 0 }}
                                animate={{ y: 0, scale: 1, opacity: 1 }}
                                exit={{ y: 12, scale: 0.98, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl leading-[36px] text-white font-noto">
                                    {t('Edit Document')}
                                </h2>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">
                                        {t('Document Name')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder={t('Document Name')}
                                        value={documentName}
                                        onChange={e => setDocumentName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 justify-end flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditDocumentOpen(false);
                                            setDocumentName('');
                                            setEditDocumentData(null);
                                        }}
                                        className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38] transition"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition"
                                    >
                                        {loading ? <Loader primary /> : t('Update')}
                                    </button>
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
};

export default EmployeeDocumentPage;

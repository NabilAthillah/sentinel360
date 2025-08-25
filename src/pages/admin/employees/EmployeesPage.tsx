import { Switch } from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmployeeDocumentPivot from "./EmployeesDocumentPivot";
import { useTranslation } from "react-i18next";
import { RootState } from "../../../store";
import { Role } from "../../../types/role";
import { Employee } from "../../../types/employee";
import employeeService from "../../../services/employeeService";
import roleService from "../../../services/roleService";
import auditTrialsService from "../../../services/auditTrailsService";
import MainLayout from "../../../layouts/MainLayout";
import Loader from "../../../components/Loader";
import DeleteModal from "../../../components/DeleteModal";
import SecondLayout from "../../../layouts/SecondLayout";
import SidebarLayout from "../../../components/SidebarLayout";
import { ArrowLeft, ArrowRight } from "lucide-react";

const EmployeesPage = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const token = useSelector((state: RootState) => state.token.token);
    const navigate = useNavigate();

    const [addEmployee, setAddEmployee] = useState(false);
    const [editEmployee, setEditEmployee] = useState(false);
    const [deleteEmployee, setDeleteEmployee] = useState(false);
    const [uploadEmployee, setUploadEmployee] = useState(false);
    const [sidebar, setSidebar] = useState(false);

    const [roles, setRoles] = useState<Role[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [reportingEmployees, setReportingEmployees] = useState<Employee[]>([]);
    const [deleteId, setDeleteId] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDatas, setSelectedDatas] = useState<string[]>([]);
    const [switchStates, setSwitchStates] = useState<{ [key: number]: boolean }>({});
    const [reasons, setReasons] = useState<{ [key: number]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const { t, i18n } = useTranslation();
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [no, setNo] = useState('');
    const [number, setNumber] = useState('');
    const [shiftType, setShiftType] = useState<string>('');
    const [status, setStatus] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<string>();

    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 5;
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(employees.length / employeesPerPage);

    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const [addData, setAddData] = useState({
        nric_fin_no: '',
        briefing_date: '',
        reporting_to: '',
        name: '',
        email: '',
        mobile: '',
        address: '',
        id_role: '',
        briefing_conducted: '',
        date_joined: ''
    });

    const [editData, setEditData] = useState<Employee | null>();

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };
    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    const togglePassword = () => setShowPassword((prev: any) => !prev);

    const formatDateTime = (date: string | Date | null): string | null => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().slice(0, 19).replace("T", " ");
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        if (!token) return;
        e.preventDefault();
        setLoading(true);
        try {


            if (!addData.mobile) {
                toast.error("Mobile number cannot be null.");
                return;
            }

            if (!addData.id_role) {
                toast.error("Role cannot be null.");
                return;
            }

            const data = [
                'Applicant filled application form?',
                'Admin to check application form/other relevant documents?',
                'HR manager to interview the applicant?',
                'HR manager conducts applicant on induction briefing on-job-duties, PSIA and PWM?',
                'Applicant signs form to acknowledge briefing conducted?',
                'Admin notify to PLRD of the deployment of the applicant?',
                'HR manager arranges with OE for OJT at site?',
                'HR manager files document?',
                'Applicant is deployed at site for OJT for 2-3?',
            ];

            const checklistMapped = data.reduce((acc, _question, index) => {
                acc[`q${index + 1}`] = switchStates[index] ? '1' : '0';
                acc[`a${index + 1}`] = switchStates[index] ? '' : (reasons[index] || '');
                return acc;
            }, {} as Record<string, any>);

            const payload = {
                name: addData.name,
                nric_fin_no: addData.nric_fin_no,
                mobile: addData.mobile,
                email: addData.email,
                id_role: addData.id_role,
                reporting_to: addData.reporting_to,
                briefing_date: addData.briefing_date,
                address: addData.address,
                briefing_conducted: addData.briefing_conducted,
                date_joined: addData.date_joined,
                ...checklistMapped,
            };

            const response = await employeeService.addEmployee(payload, token);
            if (response.success) {
                toast.success('Employee added successfully');
                setAddData({
                    nric_fin_no: '',
                    briefing_date: '',
                    reporting_to: '',
                    name: '',
                    email: '',
                    mobile: '',
                    address: '',
                    briefing_conducted: '',
                    id_role: '',
                    date_joined: ''
                });
                setAddEmployee(false);
                fetchEmployees();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e: React.SyntheticEvent) => {
        if (!token) return;
        e.preventDefault();
        setLoading(true);
        try {

            if (!editData || !editData.user) {
                toast.error("Invalid employee or user data.");
                return;
            }

            if (!editData.user.mobile) {
                toast.error("Mobile number cannot be null.");
                return;
            }

            if (!editData.user.role) {
                toast.error("Role cannot be null.");
                return;
            }

            let profileBase64: string | null = null;
            if (imageFile) {
                const toBase64 = (file: File): Promise<string> =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject("Failed to read image file.");
                    });

                profileBase64 = await toBase64(imageFile);
            }

            const response = await employeeService.editEmployee(
                editData.id,
                editData.user.name,
                editData.nric_fin_no,
                editData.user.mobile,
                editData.user.email,
                editData.user.role.id,
                editData.reporting || null,
                formatDateTime(editData.briefing_date),
                editData.birth || null,
                editData.user.address || '',
                editData.briefing_conducted ?? null,
                editData.date_joined ?? null,
                profileBase64,
                token
            );

            if (response.success) {
                toast.success('Employee updated successfully');
                fetchEmployees();
                setEditEmployee(false);
                setEditData(null);
                setImageFile(null);
            } else {
                toast.error('Failed to update employee');
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(`Server Error: ${error.response.data.message}`);
            } else if (error.message) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error("Unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (employeeId: string, status: 'pending' | 'accepted' | 'rejected') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Session expired. Please login again.");
                localStorage.clear();
                navigate('/auth/login');
                return;
            }
            const response = await employeeService.updateEmployeeStatus(employeeId, status, token);
            if (response.success) {
                if (status === 'accepted') {
                    toast.success("Account status: active");
                } else if (status === 'rejected') {
                    toast.success("Account has been deleted");
                } else {
                    toast.success(`Status updated to ${status}`);
                }
                fetchEmployees();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.clear();
                navigate('/auth/login');
            } else if (error.response?.data?.message) {
                toast.error(`Server Error: ${error.response.data.message}`);
            } else if (error.message) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error("Unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        if (!token || !user) return;
        setListLoading(true);
        try {

            const response = await employeeService.getAllEmployee(token);
            if (response.success) {
                setEmployees(response.data);
                const filtered = response.data.filter((emp: Employee) => emp.user.id !== user.id);
                setReportingEmployees(filtered);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch employees");
        } finally {
            setListLoading(false);
        }
    };

    const fetchRoles = async () => {
        if (!token) return;
        try {
            const response = await roleService.getAllRoles(token);
            if (response.success) setRoles(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = (index: number) => {
        setSwitchStates(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const audit = async () => {
        if (!token) return;
        try {
            const title = `Access employees page`;
            const description = `User ${user?.email} access employees page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access employees');
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        audit();
        fetchEmployees();
        fetchRoles();
    }, []);

    useEffect(() => {
        const checkPermission = user?.role?.permissions?.some(p => p.name === 'list_employees');
        if (!checkPermission) navigate('/dashboard');
    }, [user, navigate]);

    const anyOverlayOpen = addEmployee || editEmployee || deleteEmployee || uploadEmployee || sidebar;
    useEffect(() => {
        document.body.style.overflow = anyOverlayOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [anyOverlayOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setAddEmployee(false);
                setEditEmployee(false);
                setDeleteEmployee(false);
                setUploadEmployee(false);
                setSidebar(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const filteredEmployees = searchTerm.trim()
        ? employees.filter((emp) =>
            emp.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nric_fin_no?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const data = [
        'Applicant filled application form?',
        'Admin to check application form/other relevant documents?',
        'HR manager to interview the applicant?',
        'HR manager conducts applicant on induction briefing on-job-duties, PSIA and PWM?',
        'Applicant signs form to acknowledge briefing conducted?',
        'Admin notify to PLRD of the deployment of the applicant?',
        'HR manager arranges with OE for OJT at site?',
        'HR manager files document?',
        'Applicant is deployed at site for OJT for 2-3?',
    ];

    const handleDownload = () => {
        if (employees.length === 0) {
            toast.warning('No employee data to export.');
            return;
        }
        const headers = ['S/NO', 'NRIC/FIN', 'Name', 'Mobile', 'Email', 'Role', 'Status'];
        const rows = employees.map((emp, index) => [
            index + 1,
            emp.nric_fin_no || '',
            emp.user?.name || '',
            emp.user?.mobile || '',
            emp.user?.email || '',
            emp.user?.role?.name || '',
            emp.user?.status || '',
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'employees_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await employeeService.deleteEmployee(deleteId, token);
            if (response.success) {
                toast.success('Record deleted successfully');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setDeleteEmployee(false);
            fetchEmployees();
        }
    };

    const maskPhone = (phone: string): string => {
        if (!phone) return '';
        const visibleDigits = 4;
        const maskedLength = Math.max(0, phone.length - visibleDigits);
        return '*'.repeat(maskedLength) + phone.slice(-visibleDigits);
    };

    return (
        <SecondLayout>
            <SidebarLayout isOpen={true} closeSidebar={undefined} />
            <div className='flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full'>
                <div className="flex flex-col flex-1 gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full">
                    <div className="w-full flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex items-end gap-4 w-fit flex-wrap md:flex-nowrap">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder="Search"
                                    />
                                    <button type="button" className="p-2 rounded-[4px_4px_0px_0px]" tabIndex={-1} />
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                {t('Download Report')}
                            </button>
                        </div>

                        {user?.role?.permissions?.some(p => p.name === 'add_employee') && (
                            <div className="min-w-[160px] max-w-[200px] w-fit">
                                <button
                                    onClick={() => setAddEmployee(true)}
                                    className="font-medium text-base text-[#181d26] px-7 py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                                >
                                    {t('Add Employee')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-full relative pb-10 flex flex-1">
                        <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('S/NO')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Name')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('NRIC/FIN')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Mobile')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Role')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Status')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Action')}</th>
                                    </tr>
                                </thead>

                                {listLoading ? (
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
                                        {(searchTerm.trim() !== '' ? filteredEmployees : currentEmployees).length > 0 ? (
                                            (searchTerm.trim() !== '' ? filteredEmployees : currentEmployees).map((data, index) => (
                                                <tr className="border-b-[1px] border-b-[#98A1B3]" key={data.id}>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3">{(searchTerm.trim() !== '' ? 0 : indexOfFirstEmployee) + index + 1}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.user.name}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">{maskPhone(data.nric_fin_no)}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">{maskPhone(data.user.mobile)}</td>
                                                    <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.user.role.name}</td>
                                                    <td className="flex justify-center items-center pt-6 pb-3 ">
                                                        <div className="font-medium text-sm text-[#19CE74] px-6 py-2 bg-[rgba(25,206,116,0.16)] border-[1px] border-[#19CE74] rounded-full w-fit">
                                                            {data.user.status}
                                                        </div>
                                                    </td>
                                                    <td className="pt-6 pb-3">
                                                        <div className="flex gap-6 items-center justify-center">
                                                            {data.user.status !== 'active' && user?.role?.permissions?.some(p => p.name === 'add_employee') && (
                                                                <svg
                                                                    height="28px"
                                                                    version="1.1"
                                                                    viewBox="0 0 18 15"
                                                                    width="28px"
                                                                    className="cursor-pointer"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => handleStatusUpdate(data.id, 'accepted')}
                                                                >
                                                                    <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
                                                                        <g fill="#ffffff" transform="translate(-423.000000, -47.000000)">
                                                                            <g transform="translate(423.000000, 47.500000)">
                                                                                <path d="M6,10.2 L1.8,6 L0.4,7.4 L6,13 L18,1 L16.6,-0.4 L6,10.2 Z" />
                                                                            </g>
                                                                        </g>
                                                                    </g>
                                                                </svg>
                                                            )}
                                                            {data.user.status !== 'active' && user?.role?.permissions?.some(p => p.name === 'add_employee') && (
                                                                <svg
                                                                    height="28"
                                                                    viewBox="0 0 16 16"
                                                                    width="28"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => handleStatusUpdate(data.id, 'rejected')}
                                                                    className='cursor-pointer'
                                                                >
                                                                    <polygon
                                                                        fill="white"
                                                                        fillRule="evenodd"
                                                                        points="8 9.414 3.707 13.707 2.293 12.293 6.586 8 2.293 3.707 3.707 2.293 8 6.586 12.293 2.293 13.707 3.707 9.414 8 13.707 12.293 12.293 13.707 8 9.414"
                                                                    />
                                                                </svg>
                                                            )}
                                                            <svg className="cursor-pointer" onClick={() => setUploadEmployee(true)} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28">
                                                                <path d="M11.4628,19.672H16.7664C17.4957,19.672,18.0923,19.0753,18.0923,18.3461V11.7165H20.2005C21.3806,11.7165,21.9772,10.2846,21.1419,9.44925L15.056,3.36334C14.5401,2.84633,13.7025,2.84633,13.1865,3.36334L7.10061,9.44925C6.26529,10.2846,6.84869,11.7165,8.02874,11.7165H10.1369V18.3461C10.1369,19.0753,10.7336,19.672,11.4628,19.672ZM6.15921,22.3238H22.0701C22.7993,22.3238,23.396,22.9204,23.396,23.6497C23.396,24.3789,22.7993,24.9756,22.0701,24.9756H6.15921C5.42997,24.9756,4.83331,24.3789,4.83331,23.6497C4.83331,22.9204,5.42997,22.3238,6.15921,22.3238Z" fill="#F4F7FF" />
                                                            </svg>
                                                            {user?.role?.permissions?.some(p => p.name === 'edit_employee') && (
                                                                <svg className="cursor-pointer" onClick={() => { setEditEmployee(true); setEditData(data); }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28">
                                                                    <path d="M3.5,20.1249V24.5H7.875L20.7783,11.5967L16.4033,7.2217L3.5,20.1249ZM24.1617,8.2133C24.6166,7.7593,24.6166,7.0223,24.1617,6.5683L21.4317,3.8383C20.9777,3.3834,20.2406,3.3834,19.7867,3.8383L17.6517,5.9733L22.0267,10.3483L24.1617,8.2133Z" fill="#F4F7FF" />
                                                                </svg>
                                                            )}
                                                            <svg className="cursor-pointer" onClick={() => { setDeleteEmployee(true); setDeleteId(data?.id); }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28">
                                                                <path d="M7,24.5H21V8.16667H7V24.5ZM22.1663,4.66667H18.083L16.9163,3.5H11.083L9.91634,4.66667H5.83301V7H22.1663V4.66667Z" fill="#F4F7FF" />
                                                            </svg>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center text-white py-6">{t('No employees found.')}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>

                        {searchTerm.trim() === '' && !listLoading && (
                            <div className="flex items-center justify-center gap-3 absolute bottom-0 right-3">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                                >
                                    <ArrowLeft />
                                    {t('Prev')}
                                </button>
                                <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B] rounded-md">
                                    {currentPage}
                                </button>
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                                >
                                    {t('Next')}
                                    <ArrowRight/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {addEmployee && (
                    <motion.div
                        key="add-employee-overlay"
                        className="fixed inset-0 z-50 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setAddEmployee(false)}
                    >
                        <motion.aside
                            role="dialog"
                            aria-modal="true"
                            className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                                <h2 className='text-2xl leading-[36px] text-white font-noto'>{t('Add Employee Details')}</h2>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Name')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder='Name'
                                        onChange={(e) => setAddData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Email')}</label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder='Email'
                                        onChange={(e) => setAddData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('NRIC/FIN')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder='NRIC/FIN'
                                        onChange={(e) => setAddData(prev => ({ ...prev, nric_fin_no: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Mobile')}</label>
                                    <PhoneInput
                                        country={'sg'}
                                        onChange={(phone) => {
                                            const onlyNumbers = phone.replace(/\s/g, '');
                                            const withPlus = `+${onlyNumbers}`;
                                            setAddData((prev) => ({ ...prev, mobile: withPlus }));
                                        }}
                                        enableLongNumbers={true}
                                        inputProps={{ inputMode: 'tel' }}
                                        inputStyle={{ backgroundColor: '#222834', color: '#F4F7FF', border: 'none', width: '100%' }}
                                        buttonStyle={{ backgroundColor: '#222834', border: 'none' }}
                                        containerStyle={{ backgroundColor: '#222834' }}
                                        dropdownStyle={{ backgroundColor: '#2f3644', color: '#fff' }}
                                        placeholder="Mobile"
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Address')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder='Address'
                                        onChange={(e) => setAddData(prev => ({ ...prev, address: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <style>{`input[type="date"]::-webkit-calendar-picker-indicator{ filter: invert(1); }`}</style>
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Briefing date')}</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder="Briefing date"
                                        onChange={(e) => setAddData(prev => ({ ...prev, briefing_date: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Date Joined')}</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        placeholder='Date joined'
                                        onChange={(e) => setAddData(prev => ({ ...prev, date_joined: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Briefing Conducted')}</label>
                                    <select
                                        onChange={(e) => setAddData((prev) => ({ ...prev, briefing_conducted: e.target.value }))}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        required
                                    >
                                        <option value="yes">{t('Yes')}</option>
                                        <option value="no">{t('No')}</option>
                                    </select>
                                </div>

                                {/* {Object.entries(roles[1]).map(([category, roles]) => (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{category}</label>
                        <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                            {roles.map((role: any) => {
                                const isSelected = selectedRoles.includes(role);
                                return (
                                    <button
                                        key={role}
                                        onClick={() => toggleRole(role)}
                                        className={`font-medium text-sm leading-[20px] w-fit px-4 py-2 rounded-full bg-[#303847] text-[#F4F7FF]
                ${isSelected ? 'bg-[#446FC7] text-[#F4F7FF]' : 'bg-[#303847] text-[#F4F7FF] hover:bg-[#446FC7] hover:text-[#F4F7FF]'}`}
                                    >
                                        {role}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))} */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Role')}</label>
                                    <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                                        {roles && roles.map((r) => {
                                            const isSelected = addData.id_role === r.id;
                                            return (
                                                <p
                                                    key={r.id}
                                                    onClick={() => setAddData(prev => ({ ...prev, id_role: r.id }))}
                                                    className={`cursor-pointer font-medium text-sm leading-[20px] w-fit px-4 py-2 rounded-full bg-[#303847] text-[#F4F7FF]
                ${isSelected ? 'bg-[#446FC7] text-[#F4F7FF]' : 'bg-[#303847] text-[#F4F7FF] hover:bg-[#446FC7] hover:text-[#F4F7FF]'}`}
                                                >
                                                    {r.name}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="pt-3 flex flex-col gap-6">
                                    {data.map((item, index) => (
                                        <div key={index} className="flex flex-col gap-2">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-2">
                                                <p className="text-[#F4F7FF] text-sm flex-1">{item}</p>
                                                <div className="flex items-center gap-3 min-w-[120px] justify-end">
                                                    <Switch
                                                        id={`custom-switch-${index}`}
                                                        ripple={false}
                                                        checked={switchStates[index] || false}
                                                        onChange={() => handleToggle(index)}
                                                        className="h-full w-full checked:bg-[#446FC7]"
                                                        containerProps={{
                                                            className: "w-11 h-6",
                                                        }}
                                                        circleProps={{
                                                            className: "left-0.5 border-none",
                                                        }}
                                                        onResize={() => { }}
                                                        onResizeCapture={() => { }}
                                                        onPointerEnterCapture={() => { }}
                                                        onPointerLeaveCapture={() => { }}
                                                        crossOrigin=""
                                                    />
                                                    <p
                                                        className={`text-sm font-medium capitalize ${switchStates[index] ? 'text-[#19CE74]' : 'text-[#FF7E6A]'
                                                            }`}
                                                    >
                                                        {switchStates[index] ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            </div>
                                            {!switchStates[index] && (
                                                <input
                                                    type="text"
                                                    placeholder="Reason"
                                                    value={reasons[index] || ''}
                                                    onChange={(e) =>
                                                        setReasons((prev) => ({
                                                            ...prev,
                                                            [index]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-black"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 justify-end flex-wrap">
                                    <button type="button" onClick={() => setAddEmployee(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]">
                                        {t("Cancel")}
                                    </button>
                                    <button type="submit" className="flex justify-center items-center font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]">
                                        {loading ? <Loader primary /> : t('Save')}
                                    </button>
                                </div>
                            </form>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editEmployee && editData && (
                    <motion.div
                        key="edit-employee-overlay"
                        className="fixed inset-0 z-50 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditEmployee(false)}
                    >
                        <motion.aside
                            role="dialog"
                            aria-modal="true"
                            className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col gap-6 p-6">
                                <h2 className="text-2xl leading-[36px] text-white font-noto">{t('Edit Employee Details')}</h2>

                                <div className="flex flex-col gap-3">
                                    {imageFile ? (
                                        <img src={URL.createObjectURL(imageFile)} alt="Image" className='w-[120px] h-[120px] rounded-full object-cover object-center' />
                                    ) : (user?.profile_image ? (
                                        <img src={`${baseURL.toString() !== '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${user?.profile_image}`} alt="Image" className='w-[120px] h-[120px] rounded-full object-cover object-center' />
                                    ) : (
                                        <img src="/images/Avatar.png" alt="Default" className="w-[120px] h-[120px] object-cover" />
                                    ))}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={imageInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const maxSizeInBytes = 5 * 1024 * 1024;
                                                if (file.size > maxSizeInBytes) {
                                                    toast.warning(t('Maximum file size is 5MB!') as string);
                                                    e.target.value = "";
                                                    return;
                                                }
                                                setImageName(file.name);
                                                setImageFile(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">{t('Profile Image')} <span className='text-xs'>({t('Maximum image size is 5MB')})</span></label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                        >
                                            {t('Upload File')}
                                        </button>
                                        {imageName && <span className="text-sm text-[#98A1B3]">{imageName}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Name')}</label>
                                    <input
                                        type="text"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Name"
                                        value={editData.user?.name ?? ''}
                                        onChange={(e) =>
                                            setEditData((prev) => prev ? { ...prev, user: { ...prev.user, name: e.target.value } } : null)
                                        }
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Birth Date')}</label>
                                    <input
                                        type="date"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Birth date"
                                        value={editData?.birth ? editData.birth.substring(0, 10) : ''}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, birth: e.target.value } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('NRIC/FIN')}</label>
                                    <input
                                        type="text"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="NRIC/FIN"
                                        value={editData?.nric_fin_no ?? ''}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, nric_fin_no: e.target.value } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Mobile')}</label>
                                    <PhoneInput
                                        country={'sg'}
                                        value={editData?.user?.mobile ?? ''}
                                        onChange={(phone) => {
                                            const onlyNumbers = phone.replace(/\s/g, '');
                                            const withPlus = `+${onlyNumbers}`;
                                            setEditData((prev) => prev ? { ...prev, user: { ...prev.user, mobile: withPlus } } : null);
                                        }}
                                        enableLongNumbers
                                        inputProps={{ inputMode: 'tel' }}
                                        inputStyle={{ backgroundColor: '#222834', color: '#F4F7FF', border: 'none', width: '100%' }}
                                        buttonStyle={{ backgroundColor: '#222834', border: 'none' }}
                                        containerStyle={{ backgroundColor: '#222834' }}
                                        dropdownStyle={{ backgroundColor: '#2f3644', color: '#fff' }}
                                        placeholder="Mobile"
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Email')}</label>
                                    <input
                                        type="text"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Email"
                                        value={editData?.user?.email ?? ''}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, user: { ...prev.user, email: e.target.value } } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Address')}</label>
                                    <input
                                        type="text"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Address"
                                        value={editData?.user?.address ?? ''}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, user: { ...prev.user, address: e.target.value } } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Role')}</label>
                                    <select
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] outline-none"
                                        value={editData?.user?.role?.id || ''}
                                        onChange={(e) => {
                                            setEditData((prev) => {
                                                if (!prev || !prev.user) return prev;
                                                const selectedRole = roles.find((r) => r.id === e.target.value);
                                                if (!selectedRole) return prev;
                                                return {
                                                    ...prev,
                                                    user: { ...prev.user, role: { id: selectedRole.id, name: selectedRole.name } },
                                                } as Employee;
                                            });
                                        }}
                                    >
                                        <option value="" disabled>{t('Select Role')}</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Briefing Date')}</label>
                                    <input
                                        type="date"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Briefing Date"
                                        value={editData?.briefing_date}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, briefing_date: e.target.value } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Date Joined')}</label>
                                    <input
                                        type="date"
                                        className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                        placeholder="Date Joined"
                                        value={editData?.date_joined}
                                        onChange={(e) => setEditData((prev) => prev ? { ...prev, date_joined: e.target.value } : null)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t('Briefing Conducted')}</label>
                                    <select
                                        onChange={(e) => setAddData((prev) => ({ ...prev, briefing_conducted: e.target.value }))}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                        required
                                    >
                                        <option value="yes" selected={editData?.briefing_conducted === "yes"}>{t('Yes')}</option>
                                        <option value="no" selected={editData?.briefing_conducted === "no"}>{t('No')}</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 flex-wrap justify-end">
                                    <button onClick={() => setEditEmployee(false)} className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]">
                                        {t('Cancel')}
                                    </button>
                                    <button onClick={handleEdit} className="font-medium text-base bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]">
                                        {loading ? <Loader primary /> : t('Save')}
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteEmployee && (
                    <motion.div
                        key="delete-overlay"
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteEmployee(false)}
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.98, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 12, scale: 0.98, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DeleteModal loading={loading} setModal={setDeleteEmployee} handleDelete={handleDelete} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {uploadEmployee && user?.id && (
                <EmployeeDocumentPivot
                    employeeId={user.id}
                    token={token || ""}
                    fetchEmployees={fetchEmployees}
                    user={user}
                    onClose={() => setUploadEmployee(false)}
                />
            )}
        </SecondLayout>
    );
};

export default EmployeesPage;

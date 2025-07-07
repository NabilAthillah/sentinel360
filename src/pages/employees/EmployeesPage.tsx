import { Eye, EyeOff } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteModal from "../../components/DeleteModal";
import Loader from "../../components/Loader";
import { SwitchCustomStyleToggleable } from "../../components/SwitchCustomStyleToggleable";
import MainLayout from "../../layouts/MainLayout";
import employeeService from "../../services/employeeService";
import roleService from "../../services/roleService";
import { RootState } from "../../store";
import { Employee } from "../../types/employee";
import { Switch } from "@material-tailwind/react";

type User = {
    id: string;
    name: string;
    mobile: string;
    address?: string;
    profile_image?: string;
    email: string;
    status: string;
    role: Role;
};

type Role = {
    id: string;
    name: string;
};

const EmployeesPage = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();
    const [addEmployee, setAddEmployee] = useState(false);
    const [editEmployee, setEditEmployee] = useState(false);
    const [deleteEmployee, setDeleteEmployee] = useState(false);
    const [uploadEmployee, setUploadEmployee] = useState(false);
    const [sidebar, setSidebar] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [deleteId, setDeleteId] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDatas, setSelectedDatas] = useState<string[]>([]);
    const [switchStates, setSwitchStates] = useState<{ [key: number]: boolean }>({});
    const [reasons, setReasons] = useState<{ [key: number]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');

    const profileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileName, setProfileName] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [no, setNo] = useState('');
    const [number, setNumber] = useState('');
    const [shiftType, setShiftType] = useState<string>('');
    const [status, setStatus] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [reportingEmployees, setReportingEmployees] = useState<Employee[]>([]);
    const [role, setRole] = useState<string>();

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
    });

    const [editData, setEditData] = useState<Employee | null>();
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 5;


    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const totalPages = Math.ceil(employees.length / employeesPerPage);
    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');
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


    const togglePassword = () => {
        setShowPassword((prev: any) => !prev);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const checklistMapped = data.reduce((acc, question, index) => {
                acc[`q${index + 1}`] = question;
                acc[`a${index + 1}`] = switchStates[index] ? 1 : 0;
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
                ...checklistMapped,
            };

            const response = await employeeService.addEmployee(payload, token!);

            if (response.success) {
                toast.success('Employee added successfully');
                fetchEmployees();
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setAddEmployee(false);
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
            });
        }
    };



    const handleEdit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Token not found. Redirecting to login.");
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (!editData || !editData.user || !editData.user.role || !editData.user.role.name) {
                toast.error("Invalid employee or user data.");
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
                editData.briefing_date || null,
                editData.birth || null,
                editData.user.address || '',
                editData.briefing_conducted ?? null,
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




    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await employeeService.getAllEmployee(token);

            if (response.success) {
                setEmployees(response.data);
                const filtered = response.data.filter((emp: Employee) => emp.user.id != currentUser.id);
                setReportingEmployees(filtered);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await roleService.getAllRoles(token);

            if (response.success) {
                setRoles(response.data)
            }
        } catch (error) {
            console.error(error)
        }
    }
    const handleToggle = (index: number) => {
        setSwitchStates(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };


    useEffect(() => {
        fetchEmployees();
        fetchRoles();
    }, [])

    const shift = [
        'Day',
        'Night',
        'Relief',
    ]

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
    ]

    const handleDownload = () => {
        if (employees.length === 0) {
            toast.warning('No employee data to export.');
            return;
        }

        const headers = ['S. No', 'NRIC/FIN', 'Name', 'Mobile', 'Email', 'Role', 'Status'];

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
            .map(row =>
                row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';') // GANTI ke titik koma
            )
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
            toast.error(error.message)
        } finally {
            setDeleteEmployee(false);
            fetchEmployees();
        }
    }

    const maskPhone = (phone: string): string => {
        if (!phone) return '';
        const visibleDigits = 4;
        const maskedLength = Math.max(0, phone.length - visibleDigits);
        return '*'.repeat(maskedLength) + phone.slice(-visibleDigits);
    };

    useEffect(() => {
        const checkPermission = user?.role?.permissions?.some(p => p.name === 'List employees');
        if (!checkPermission) {
            navigate('/dashboard')
        }
    }, [user])

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Employees</h2>
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
                                    <button type="button" className="p-2 rounded-[4px_4px_0px_0px]" tabIndex={-1}>
                                        {/* ikon search */}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                Download Report
                            </button>
                        </div>
                        <div className="min-w-[160px] max-w-[200px] w-fit">
                            <button onClick={() => setAddEmployee(true)} className="font-medium text-base text-[#181d26] px-7 py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add employee</button>
                        </div>
                    </div>
                    <div className="w-full h-full relative pb-10 flex flex-1">
                        <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">S. no</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">NIRC/FIN</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Mobile</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Role</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(searchTerm.trim() != '' ? filteredEmployees : employees).map((data, index) => (
                                        <tr className="border-b-[1px] border-b-[#98A1B3]" key={data.id}>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{index + 1}</td>
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
                                                    <svg className="cursor-pointer" onClick={() => setUploadEmployee(true)} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14305"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14305)"><g><path d="M11.46283298828125,19.6719859375L16.76641298828125,19.6719859375C17.495712988281248,19.6719859375,18.09231298828125,19.0752859375,18.09231298828125,18.3460859375L18.09231298828125,11.7165359375L20.20051298828125,11.7165359375C21.38061298828125,11.7165359375,21.97721298828125,10.2845659375,21.14191298828125,9.449245937499999L15.05601298828125,3.3633379375C14.54009298828125,2.8463349375,13.70246298828125,2.8463349375,13.18651298828125,3.3633379375L7.1006129882812505,9.449245937499999C6.26529298828125,10.2845659375,6.84869298828125,11.7165359375,8.02874298828125,11.7165359375L10.136932988281249,11.7165359375L10.136932988281249,18.3460859375C10.136932988281249,19.0752859375,10.73359298828125,19.6719859375,11.46283298828125,19.6719859375ZM6.15921298828125,22.3237859375L22.07011298828125,22.3237859375C22.79931298828125,22.3237859375,23.39601298828125,22.9203859375,23.39601298828125,23.6496859375C23.39601298828125,24.3788859375,22.79931298828125,24.9755859375,22.07011298828125,24.9755859375L6.15921298828125,24.9755859375C5.42996998828125,24.9755859375,4.83331298828125,24.3788859375,4.83331298828125,23.6496859375C4.83331298828125,22.9203859375,5.42996998828125,22.3237859375,6.15921298828125,22.3237859375Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg className="cursor-pointer" onClick={() => {
                                                        setEditEmployee(true);
                                                        setEditData(data);
                                                    }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg className="cursor-pointer" onClick={() => { setDeleteEmployee(true); setDeleteId(data?.id) }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
            {
                addEmployee && (
                    <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Add employee details</h2>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Name'
                                    onChange={(e) => setAddData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                <input
                                    type={"email"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Email'
                                    onChange={(e) => setAddData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">NRIC/FIN</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='NRIC/FIN'
                                    onChange={(e) => setAddData(prev => ({ ...prev, nric_fin_no: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Mobile'
                                    onChange={(e) => setAddData(prev => ({ ...prev, mobile: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Address</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Address'
                                    onChange={(e) => setAddData(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Briefing date</label>
                                <input
                                    type={"date"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Briefing date'
                                    onChange={(e) => setAddData(prev => ({ ...prev, briefing_date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="briefing_conducted" className="text-xs leading-[21px] text-[#98A1B3]">Briefing conducted</label>
                                <input
                                    type="text"
                                    id="briefing_conducted"
                                    placeholder="Briefing conducted"
                                    value={addData.briefing_conducted || ""}
                                    onChange={(e) =>
                                        setAddData((prev) => ({ ...prev, briefing_conducted: e.target.value }))
                                    }
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="reporting_to" className="text-xs leading-[21px] text-[#98A1B3]">Reporting To</label>
                                <input
                                    type="text"
                                    id="reporting_to"
                                    placeholder="Reporting To"
                                    value={addData.reporting_to || ""}
                                    onChange={(e) =>
                                        setAddData((prev) => ({ ...prev, reporting_to: e.target.value }))
                                    }
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                />
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
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Role</label>
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
                                            {/* Label pertanyaan */}
                                            <p className="text-[#F4F7FF] text-sm flex-1">{item}</p>

                                            {/* Switch + status */}
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

                                        {/* Input alasan jika switch OFF */}
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

                            {/* <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Remarks</label>
                    <input
                        type={"text"}
                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                        placeholder='Remarks'
                        value='Will settle it by end of the week'
                    />
                </div> */}
                            <div className="flex gap-4 flex-wrap">
                                <button type="submit" className="flex justify-center items-center font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                                <button onClick={() => setAddEmployee(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </form>
                    </div>
                )
            }
            {editEmployee && editData && (
                <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                        <h2 className="text-2xl leading-[36px] text-white font-noto">Edit employee details</h2>

                        <div className="relative">
                            {imageFile ? (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    className="w-[120px] h-[120px] object-cover rounded-full"
                                />
                            ) : editData?.user?.profile_image ? (
                                <img
                                    src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${editData.user.profile_image}`}
                                    alt="Profile"
                                    className="w-[120px] h-[120px] object-cover rounded-full"
                                />
                            ) : (
                                <img
                                    src="/images/Avatar.png"
                                    alt="Default"
                                    className="w-[120px] h-[120px] object-cover rounded-full"
                                />
                            )} */}
                            <div className="relative">
                                <img
                                    src="/images/Image@1x.png"
                                    alt="Default"
                                    className="w-[104px] h-[104px] object-cover rounded-full"
                                />
                                <img
                                    src="/images/icon@1x.png"
                                    alt="Default"
                                    className="w-[104px] h-[104px] object-cover rounded-full"
                                />
                            </div>

                            {/* <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                                className="mt-2 text-sm text-white"
                            /> */}

                            <div className="flex flex-col gap-3">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Profile image <span className='text-xs'>(Max file size: 5MB)</span><span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span></label>
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
                                {editData.user.profile_image && (
                                    <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${editData.user.profile_image}`} alt="Image" className='h-14 w-fit' />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        console.log("Selected image file:", file);
                                        if (file) {
                                            const maxSizeInBytes = 5 * 1024 * 1024;

                                            if (file.size > maxSizeInBytes) {
                                                alert("Maximum image size is 5MB!");
                                                e.target.value = "";
                                                return;
                                            }

                                            setImageName(file.name);
                                            setImageFile(file)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Name</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Name"
                                value={editData.user?.name ?? ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, user: { ...prev.user, name: e.target.value } } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Birth Date</label>
                            <input
                                type="date"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Birth date"
                                value={editData?.birth ? editData.birth.substring(0, 10) : ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, birth: e.target.value } : null
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">NRIC/FIN</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="NRIC/FIN"
                                value={editData.nric_fin_no ?? ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, nric_fin_no: e.target.value } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Mobile</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Mobile"
                                value={editData.user?.mobile ?? ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, user: { ...prev.user, mobile: e.target.value } } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Email</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Email"
                                value={editData.user?.email ?? ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, user: { ...prev.user, email: e.target.value } } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Address</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Address"
                                value={editData.user?.address ?? ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, user: { ...prev.user, address: e.target.value } } : null
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Role</label>
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
                                            user: {
                                                ...prev.user,
                                                role: {
                                                    id: selectedRole.id,
                                                    name: selectedRole.name,
                                                },
                                            },
                                        } as Employee;
                                    });
                                }}


                            >
                                <option value="" disabled>Select role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Briefing Date</label>
                            <input
                                type="datetime-local"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Briefing Date"
                                value={
                                    editData.briefing_date
                                        ? new Date(editData.briefing_date).toISOString().slice(0, 16)
                                        : ''
                                }
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, briefing_date: new Date(e.target.value) } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Briefing Conducted By</label>
                            <input
                                type="text"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] outline-none"
                                placeholder="Briefing Conducted By"
                                value={editData?.briefing_conducted || ''}
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, briefing_conducted: e.target.value } : null
                                    )
                                }
                            />
                        </div>


                        {/* Buttons */}
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={handleEdit}
                                className="font-medium text-base bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditEmployee(false)}
                                className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                deleteEmployee && (
                    <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <DeleteModal setModal={setDeleteEmployee} handleDelete={handleDelete} />
                    </div>
                )
            }
            {
                uploadEmployee && (
                    <div>
                        <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                            <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                                <h2 className='text-2xl leading-[36px] text-white font-noto'>Edit employee details</h2>
                                <div className="relative flex gap-10 w-full">
                                    <img src="/images/Avatar2.png" alt="" className="w-[104px] h-[104px]" />
                                    <div className="flex flex-col gap-4">
                                        <p className="font-medium text-xl leading-[20px] text-[#F4F7FF]">Michella Yeow</p>
                                        <div className="flex gap-16">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs leading-[16px] text-[#98A1B3]">NRIC/FIN</p>
                                                <p className="leading-[20px] text-[#F4F7FF]">***304F</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs leading-[16px] text-[#98A1B3]">Mobile</p>
                                                <p className="leading-[20px] text-[#F4F7FF]">***5672</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs leading-[16px] text-[#98A1B3]">Email</p>
                                            <p className="leading-[20px] text-[#F4F7FF]">mi******ow@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full pl-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834]">
                                    <div className="flex flex-col w-full">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder="Masukkan password"
                                            value={'●●●●●●●●●●'}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="p-2 rounded-[4px_4px_0px_0px]"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color="#98A1B3" style={{ backgroundColor: "#222834", borderRadius: "4px" }} />
                                        ) : (
                                            <Eye size={20} color="#98A1B3" style={{ backgroundColor: "#222834", borderRadius: "4px" }} />
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Lorem ipsum</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">PLRD license</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Employment letter</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Resume</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Certifications</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Qualifications</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex gap-4 flex-wrap">
                                    <button onClick={() => { setUploadEmployee(false); toast.success('Employee document uploaded successfully') }} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                    <button onClick={() => setUploadEmployee(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </MainLayout >
    )
}

export default EmployeesPage
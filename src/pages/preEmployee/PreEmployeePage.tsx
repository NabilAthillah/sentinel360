import React from 'react'
import MainLayout from "../../layouts/MainLayout";
import { Switch } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteModal from "../../components/DeleteModal";
import Loader from "../../components/Loader";
import employeeService from "../../services/employeeService";
import roleService from "../../services/roleService";
import { RootState } from "../../store";
import { Employee } from "../../types/employee";
import { Role } from "../../types/role";
import EmployeeDocumentPivot from '../employees/EmployeesDocumentPivot';
const PreEmployeePage = () => {
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

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);

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
        e.preventDefault()
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const checklistMapped = data.reduce((acc, question, index) => {
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
                toast.success('Employee added successfully')
                fetchEmployees();
            }
        } catch (error: any) {
            toast.error(error.message)
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
                date_joined: ''
            })
        }
    }
    const formatDateTime = (date: string | Date | null): string | null => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().slice(0, 19).replace("T", " ");
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

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await employeeService.getAllEmployee(token);

            if (response.success) {
                setEmployees(response.data);
                const filtered = response.data.filter((emp: Employee) => emp.user.id !== currentUser.id);
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
                // const data = response.data.filter((r: Role) => r.status === 'active');
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
    const handleStatusUpdate = async (employeeId: string, status: 'pending' | 'accepted' | 'rejected') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Token not found. Redirecting to login.");
                localStorage.clear();
                navigate('/login');
                return;
            }

            const response = await employeeService.updateEmployeeStatus(employeeId, status, token);

            if (response.success) {
                toast.success(`Status updated to ${status}`);
                fetchEmployees();
            } else {
                toast.error(response.message || 'Failed to update status');
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

    const maskPhone = (phone: string): string => {
        if (!phone) return '';
        const visibleDigits = 4;
        const maskedLength = Math.max(0, phone.length - visibleDigits);
        return '*'.repeat(maskedLength) + phone.slice(-visibleDigits);
    };

    useEffect(() => {
        const checkPermission = user?.role?.permissions?.some(p => p.name === 'list_employees');
        if (!checkPermission) {
            navigate('/dashboard');
        }
    }, [user])

    useEffect(() => {
        console.log(addData.mobile)
    }, [addData.mobile])

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Pre-Employees</h2>
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
                        {user?.role?.permissions?.some(p => p.name === 'add_employee') && (
                            <div className="min-w-[160px] max-w-[200px] w-fit">
                                <button onClick={() => setAddEmployee(true)} className="font-medium text-base text-[#181d26] px-7 py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add employee</button>
                            </div>
                        )}
                    </div>
                    <div className="w-full h-full relative pb-10 flex flex-1">
                        <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">S/NO</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Name</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">NIRC/FIN</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Mobile</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Role</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(searchTerm.trim() !== '' ? filteredEmployees : employees)
                                        .filter(data => data.status === 'Pending' || data.status === 'Rejected')
                                        .map((data, index) => (
                                            <tr className="border-b-[1px] border-b-[#98A1B3]" key={data.id}>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{index + 1}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.user.name}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">{maskPhone(data.nric_fin_no)}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">{maskPhone(data.user.mobile)}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.user.role.name}</td>
                                                <td className="flex justify-center items-center pt-6 pb-3 ">
                                                    <div className="font-medium text-sm text-[#19CE74] px-6 py-2 bg-[rgba(25,206,116,0.16)] border-[1px] border-[#19CE74] rounded-full w-fit">
                                                        {data.status}
                                                    </div>
                                                </td>
                                                <td className="pt-6 pb-3">
                                                    <div className="flex gap-6 items-center justify-center">
                                                        {user?.role?.permissions?.some(p => p.name === 'add_employee') && (
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
                                                        {user?.role?.permissions?.some(p => p.name === 'add_employee') && (
                                                            <svg height="28" viewBox="0 0 16 16" width="28" xmlns="http://www.w3.org/2000/svg" 
                                                            onClick={() => handleStatusUpdate(data.id, 'rejected')}
                                                            className='cursor-pointer'>
                                                                <polygon
                                                                    fill="white"
                                                                    fill-rule="evenodd"
                                                                    points="8 9.414 3.707 13.707 2.293 12.293 6.586 8 2.293 3.707 3.707 2.293 8 6.586 12.293 2.293 13.707 3.707 9.414 8 13.707 12.293 12.293 13.707 8 9.414"
                                                                />
                                                            </svg>

                                                        )}

                                                        {user?.role?.permissions?.some(p => p.name === 'edit_employee') && (
                                                            <svg className="cursor-pointer" onClick={() => {
                                                                setEditEmployee(true);
                                                                setEditData(data);
                                                            }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                        )}
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
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Add Employee Details</h2>
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
                                <PhoneInput
                                    country={'sg'}
                                    onChange={(phone) => {
                                        const onlyNumbers = phone.replace(/\s/g, '');
                                        const withPlus = `+${onlyNumbers}`;
                                        setAddData((prev) => ({ ...prev, mobile: withPlus }));
                                    }}
                                    enableLongNumbers={true}
                                    inputProps={{
                                        inputMode: 'tel',
                                    }}
                                    inputStyle={{
                                        backgroundColor: '#222834',
                                        color: '#F4F7FF',
                                        border: 'none',
                                        width: '100%',
                                    }}
                                    buttonStyle={{
                                        backgroundColor: '#222834',
                                        border: 'none',
                                    }}
                                    containerStyle={{
                                        backgroundColor: '#222834',
                                    }}
                                    dropdownStyle={{
                                        backgroundColor: '#2f3644',
                                        color: '#fff',
                                    }}
                                    placeholder="Mobile"
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
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Date joined</label>
                                <input
                                    type={"date"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Date joined'
                                    onChange={(e) => setAddData(prev => ({ ...prev, date_joined: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="briefing_conducted" className="text-xs leading-[21px] text-[#98A1B3]">Briefing conducted</label>
                                <select
                                    onChange={(e) =>
                                        setAddData((prev) => ({ ...prev, briefing_conducted: e.target.value }))
                                    }
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
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
                        <h2 className="text-2xl leading-[36px] text-white font-noto">Edit Employee Details</h2>

                        <div className="flex flex-col gap-3">
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="Image" className='w-[120px] h-[120px] rounded-full object-cover object-center' />
                            ) : (user?.profile_image ? (
                                <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${user?.profile_image}`} alt="Image" className='w-[120px] h-[120px] rounded-full object-cover object-center' />
                            ) : (
                                <img
                                    src="/images/Avatar.png"
                                    alt="Default"
                                    className="w-[120px] h-[120px] object-cover"
                                />
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
                                            toast.warning('Maximum file size is 5MB!');
                                            e.target.value = "";
                                            return;
                                        }

                                        setImageName(file.name);
                                        setImageFile(file);
                                    }
                                }}
                                className="hidden"
                            />
                            <label className="text-xs leading-[21px] text-[#98A1B3]">Profile image <span className='text-xs'>(Maximum image size is 5MB!)</span></label>
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
                            <PhoneInput
                                country={'sg'}
                                value={editData.user?.mobile ?? ''}
                                onChange={(phone) => {
                                    const onlyNumbers = phone.replace(/\s/g, '');
                                    const withPlus = `+${onlyNumbers}`;
                                    setEditData((prev) =>
                                        prev ? { ...prev, user: { ...prev.user, mobile: withPlus } } : null
                                    )
                                }}
                                enableLongNumbers={true}
                                inputProps={{
                                    inputMode: 'tel',
                                }}
                                inputStyle={{
                                    backgroundColor: '#222834',
                                    color: '#F4F7FF',
                                    border: 'none',
                                    width: '100%',
                                }}
                                buttonStyle={{
                                    backgroundColor: '#222834',
                                    border: 'none',
                                }}
                                containerStyle={{
                                    backgroundColor: '#222834',
                                }}
                                dropdownStyle={{
                                    backgroundColor: '#2f3644',
                                    color: '#fff',
                                }}
                                placeholder="Mobile"
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
                                }
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, briefing_date: e.target.value } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Date Joined</label>
                            <input
                                type="datetime-local"
                                className="bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
                                placeholder="Date Joined"
                                value={
                                    editData.date_joined
                                }
                                onChange={(e) =>
                                    setEditData((prev) =>
                                        prev ? { ...prev, date_joined: e.target.value } : null
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Briefing Conducted</label>
                            <select
                                onChange={(e) =>
                                    setAddData((prev) => ({ ...prev, briefing_conducted: e.target.value }))
                                }
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                            >
                                <option value="yes" selected={editData?.briefing_conducted === "yes"}>Yes</option>
                                <option value="no" selected={editData?.briefing_conducted === "no"}>No</option>
                            </select>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={handleEdit}
                                className="font-medium text-base bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                            >
                                {loading ? <Loader /> : 'Save'}
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
            {uploadEmployee && user?.employee?.id && (
                <EmployeeDocumentPivot
                    employeeId={user.employee.id}
                    token={localStorage.getItem("token") || ""}
                    fetchEmployees={fetchEmployees}
                    user={user}
                    onClose={() => setUploadEmployee(false)}
                />
            )}


        </MainLayout >
    )
}

export default PreEmployeePage
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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

type Employee = {
    id: string;
    nric_fin_no: string;
    briefing_date?: Date;
    user: User;
    reporting_to: User;
    shift: string;
};

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

    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDatas, setSelectedDatas] = useState<string[]>([]);

    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState('');
    const [no, setNo] = useState('');
    const [number, setNumber] = useState('');
    const [shiftType, setShiftType] = useState<string>('');
    const [status, setStatus] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [role, setRole] = useState<string>();

    const [addData, setAddData] = useState({
        nric_fin_no: '',
        briefing_date: '',
        reporting_to: '',
        shift: '',
        name: '',
        email: '',
        mobile: '',
        address: '',
        id_role: '',
    });

    const togglePassword = () => {
        setShowPassword((prev: any) => !prev);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const response = await employeeService.addEmployee(
                addData.name,
                addData.nric_fin_no,
                addData.mobile,
                addData.shift,
                addData.email,
                addData.id_role,
                addData.reporting_to,
                addData.briefing_date,
                addData.address,
                token);

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
                shift: '',
                name: '',
                email: '',
                mobile: '',
                address: '',
                id_role: '',
            })
        }
    }

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await employeeService.getAllEmployee(token);

            if (response.success) {
                setEmployees(response.data)
            }
        } catch (error) {
            console.error(error)
        }
    }

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

    useEffect(() => {
        fetchEmployees();
        fetchRoles();
    }, [])

    const shift = [
        'Day',
        'Night',
        'Relief',
    ]

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
        const maskedLength = phone.length - visibleDigits;
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
                            <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                <input
                                    type={"text"}
                                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="Search"
                                />
                                <button
                                    type="button"
                                    className="p-2 rounded-[4px_4px_0px_0px]"
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clipPath="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                                </button>
                            </div>
                            <button className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all">Download Report</button>
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
                                        <th className="font-semibold text-[#98A1B3] text-start">Shift</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length > 0 && employees.map((data, index) => (
                                        <tr className="border-b-[1px] border-b-[#98A1B3]" key={data.id}>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{index + 1}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.nric_fin_no}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">{maskPhone(data.user.mobile)}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.user.role.name}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">{data.shift}</td>
                                            <td className="flex justify-center items-center pt-6 pb-3 ">
                                                <div className="font-medium text-sm text-[#19CE74] px-6 py-2 bg-[rgba(25,206,116,0.16)] border-[1px] border-[#19CE74] rounded-full w-fit">
                                                    Active
                                                </div>
                                            </td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <svg className="cursor-pointer" onClick={() => setUploadEmployee(true)} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14305"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14305)"><g><path d="M11.46283298828125,19.6719859375L16.76641298828125,19.6719859375C17.495712988281248,19.6719859375,18.09231298828125,19.0752859375,18.09231298828125,18.3460859375L18.09231298828125,11.7165359375L20.20051298828125,11.7165359375C21.38061298828125,11.7165359375,21.97721298828125,10.2845659375,21.14191298828125,9.449245937499999L15.05601298828125,3.3633379375C14.54009298828125,2.8463349375,13.70246298828125,2.8463349375,13.18651298828125,3.3633379375L7.1006129882812505,9.449245937499999C6.26529298828125,10.2845659375,6.84869298828125,11.7165359375,8.02874298828125,11.7165359375L10.136932988281249,11.7165359375L10.136932988281249,18.3460859375C10.136932988281249,19.0752859375,10.73359298828125,19.6719859375,11.46283298828125,19.6719859375ZM6.15921298828125,22.3237859375L22.07011298828125,22.3237859375C22.79931298828125,22.3237859375,23.39601298828125,22.9203859375,23.39601298828125,23.6496859375C23.39601298828125,24.3788859375,22.79931298828125,24.9755859375,22.07011298828125,24.9755859375L6.15921298828125,24.9755859375C5.42996998828125,24.9755859375,4.83331298828125,24.3788859375,4.83331298828125,23.6496859375C4.83331298828125,22.9203859375,5.42996998828125,22.3237859375,6.15921298828125,22.3237859375Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg className="cursor-pointer" onClick={() => setEditEmployee(true)} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                    <svg className="cursor-pointer" onClick={() => { setDeleteEmployee(true); setDeleteId(data?.id) }} xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                            <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F]">Prev</button>
                            <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">1</button>
                            <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F]">Next</button>
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
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Briefing conducted by</label>
                                <select className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none" onChange={(e) => setAddData(prev => ({ ...prev, reporting_to: e.target.value }))}>
                                    <option value="">Select Emloyee</option>
                                    {employees.length > 0 && employees.map((item) => (
                                        <option key={item.id} value={item.id}>{item.user?.name}</option>
                                    ))}
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
                            <div className="flex flex-col gap-2">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Shift</label>
                                <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                                    {shift.map((s: any) => {
                                        const isSelected = addData.shift === s;
                                        return (
                                            <p
                                                key={s}
                                                onClick={() => setAddData(prev => ({ ...prev, shift: s }))}
                                                className={`cursor-pointer font-medium text-sm leading-[20px] w-fit px-4 py-2 rounded-full bg-[#303847] text-[#F4F7FF]
                ${isSelected ? 'bg-[#446FC7] text-[#F4F7FF]' : 'bg-[#303847] text-[#F4F7FF] hover:bg-[#446FC7] hover:text-[#F4F7FF]'}`}
                                            >
                                                {s}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-3 flex flex-col gap-6">
                                {data.map((item) => (
                                    <div className="flex items-center justify-between">
                                        <p className="leading-[21px] text-[#F4F7FF]">{item}</p>
                                        <SwitchCustomStyleToggleable />
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
            {
                editEmployee && (
                    <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Edit employee details</h2>
                            <div className="relative">
                                <img src="/images/Avatar.png" alt="" />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Name'
                                    value='Michael Yeow'
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">NRIC/FIN</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='NRIC/FIN'
                                    value='S8934554F'
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Mobile'
                                    value='90044587'
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Email'
                                    value='mich.yeow@gmail.com'
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Briefing conducted by</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Briefing conducted by'
                                    value='David'
                                />
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Briefing date</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Briefing date'
                                    value='24/05/2025'
                                />
                            </div>
                            {/* {Object.entries(roles[1]).map(([category, roles]) => (
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{category}</label>
                                    <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                                        {roles.map((role: any) => {
                                            const isSelected = selectedDatas.includes(role);
                                            return (
                                                <button
                                                    key={role}
                                                    onClick={() => toggleData(role)}
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
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Remarks</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Remarks'
                                    value='Will settle it by end of the week'
                                />
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => { setEditEmployee(false); toast.success('Employee edited successfully') }} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                <button onClick={() => setEditEmployee(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {deleteEmployee && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <DeleteModal setModal={setDeleteEmployee} handleDelete={handleDelete} />
                </div>
            )}
            {uploadEmployee && (
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
            )}
        </MainLayout>
    )
}

export default EmployeesPage
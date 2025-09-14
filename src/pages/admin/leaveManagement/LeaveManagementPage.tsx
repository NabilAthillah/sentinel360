import { Switch } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarLayout from "../../../components/SidebarLayout";
import SecondLayout from "../../../layouts/SecondLayout";
import leaveManagement from "../../../services/leaveManagement";
import { leaveTypeService } from "../../../services/leaveManagementType";
import siteService from "../../../services/siteService";
import userService from "../../../services/userService";
import { RootState } from "../../../store";
import { LeaveManagement } from "../../../types/leaveManagements";
import { Site } from "../../../types/site";
import { User } from "../../../types/user";
import { Check, X } from "lucide-react";

const ITEMS_PER_PAGE = 5; // jumlah data per page

type NewLeaveType = {
    name: string;
    status: "active" | "deactive";
};

const LeaveManagementPage = () => {
    const token = useSelector((state: RootState) => state.token.token);
    const [sidebar, setSidebar] = useState(true);
    const [add, setAdd] = useState(false);
    const [leaves, setLeaves] = useState<LeaveManagement[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [siteFilter, setSiteFilter] = useState("");
    const [employeeFilter, setEmployeeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
        from: "",
        to: "",
    });
    const [newLeaveTypes, setNewLeaveTypes] = useState<NewLeaveType[]>([
        { name: "", status: "active" },
    ]);
    const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string }[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [sites, setSites] = useState<Site[]>([]);


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const formatToYMD = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    const fetchLeaves = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await leaveManagement.getLeaveManagement();
            console.log("Leaves API Response:", res);
            setLeaves(res.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch leave data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();

        const fetchFilters = async () => {
            try {
                const [typesRes, usersRes, sitesRes] = await Promise.all([
                    leaveTypeService.getAll(),
                    userService.getAllUsers(),
                    siteService.getAllSite(token),
                ]);

                setLeaveTypes(typesRes.data || []);
                setEmployees(usersRes.data || []);
                setSites(sitesRes.data);
            } catch (err: any) {
                toast.error(err.message || "Failed to fetch filter data");
            }
        };

        if (token) fetchFilters();
    }, [token]);

    const filteredLeaves = leaves.filter((leave) => {
        const matchSearch =
            search === "" ||
            leave.type?.toLowerCase().includes(search.toLowerCase()) ||
            leave.user?.name?.toLowerCase().includes(search.toLowerCase());

        const matchSite = siteFilter === "" || leave.site?.id === siteFilter;
        const matchEmployee = employeeFilter === "" || leave.user?.id === employeeFilter;
        const matchType = statusFilter === "" || leave.type?.toLowerCase() === statusFilter.toLowerCase();

        const matchDate =
            (dateRange.from === "" || new Date(leave.from) >= new Date(dateRange.from)) &&
            (dateRange.to === "" || new Date(leave.to) <= new Date(dateRange.to));

        return matchSearch && matchSite && matchEmployee && matchType && matchDate;
    });

    const handleStatusUpdate = async (id: string, status: 'pending' | 'approve' | 'rejected') => {
        setLoading(true);
        if (!token) {
            navigate('/auth/login');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Session expired. Please login again.");
                localStorage.clear();
                navigate('/auth/login');
                return;
            }
            const response = await leaveManagement.updateLeaveStatus(id, status, token);
            if (response.success) {
                if (status === 'approve') {
                    toast.success("Leave Management: active");
                } else if (status === 'rejected') {
                    toast.success("Leave Management has been rejected");
                } else {
                    toast.success(`Status updated to ${status}`);
                }
                fetchLeaves();
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

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE));
    const paginatedLeaves = filteredLeaves.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleAddMore = () => {
        setNewLeaveTypes([...newLeaveTypes, { name: "", status: "active" }]);
    };

    const handleRemove = (index: number) => {
        setNewLeaveTypes(newLeaveTypes.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof NewLeaveType, value: any) => {
        const updated = [...newLeaveTypes];
        updated[index][field] = value;
        setNewLeaveTypes(updated);
    };

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    return (
        <SecondLayout>
            <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
            <div className="flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1">
                <h2 className="text-2xl leading-9 text-white font-noto">Leave Managements</h2>
                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="flex flex-col gap-4 flex-wrap">
                        <div className="flex items-end justify-between gap-4 w-full flex-wrap md:flex-nowrap">
                            <div className="max-w-[350px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                <input
                                    type="text"
                                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] active:outline-none focus-visible:outline-none"
                                    placeholder="Search by employee"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />

                                <button
                                    type="button"
                                    className="p-2 rounded-[4px_4px_0px_0px]"
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clipPath="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fillOpacity="1" /></g></g></svg>
                                </button>
                            </div>
                            <div className="min-w-[180px] max-w-[200px]">
                                <button
                                    onClick={() => setAdd(true)}
                                    className="font-medium text-base text-[#181d26] px-7 py-[13.5px] border border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                                >
                                    Add leave type
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            {/* Row 1: Site, Employee, Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                                {/* Site filter */}
                                <select
                                    value={siteFilter}
                                    onChange={(e) => setSiteFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] 
                 border-b border-[#98A1B3] rounded"
                                >
                                    <option value="">All Sites</option>
                                    {sites?.map(site => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Employee filter */}
                                <select
                                    value={employeeFilter}
                                    onChange={(e) => setEmployeeFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] 
                 border-b border-[#98A1B3] rounded"
                                >
                                    <option value="">All Employees</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Type filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] 
                 border-b border-[#98A1B3] rounded"
                                >
                                    <option value="">All Types</option>
                                    {leaveTypes?.map(type => (
                                        <option key={type.id} value={type.name}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Row 2: Date Range */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    className="w-full sm:w-auto px-2 py-2 bg-[#222834] text-[#F4F7FF] 
                 border-b border-[#98A1B3] rounded"
                                />
                                <span className="text-[#F4F7FF] text-center sm:text-left">to</span>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    className="w-full sm:w-auto px-2 py-2 bg-[#222834] text-[#F4F7FF] 
                 border-b border-[#98A1B3] rounded"
                                />
                                <button
                                    onClick={() => setDateRange({ from: "", to: "" })}
                                    className="text-sm w-full sm:w-auto text-[#EFBF04] px-3 py-2 border 
                 border-[#EFBF04] rounded-full hover:bg-[#EFBF04] 
                 hover:text-[#252C38] transition-all"
                                >
                                    {t("Clear Time")}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* TABLE */}
                    <div className="w-full h-full relative flex flex-1 pb-10">
                        <div className="w-full h-fit overflow-auto pb-5">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">S/NO</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Name</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Type</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">From</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">To</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Total</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Date submitted</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Action</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center text-[#98A1B3] py-6">
                                                No leave data found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedLeaves.map((leave, index) => (
                                            <tr key={leave.id}>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                </td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{leave.user?.name}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{leave.type}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{leave.from}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{leave.to}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{leave.total} days</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">
                                                    {formatToYMD(leave.created_at)}
                                                </td>
                                                <td className="flex justify-center items-center pt-6 pb-3 ">
                                                    <div
                                                        className={`
                                                                font-medium text-sm px-6 py-2 rounded-full w-fit capitalize
                                                                ${leave.status === "approve"
                                                                ? "text-[#19CE74] bg-[rgba(25,206,116,0.16)] border border-[#19CE74]"
                                                                : leave.status === "pending"
                                                                    ? "text-[#EAB308] bg-[rgba(234,179,8,0.16)] border border-[#EAB308]"
                                                                    : leave.status === "rejected"
                                                                        ? "text-[#EF4444] bg-[rgba(239,68,68,0.16)] border border-[#EF4444]"
                                                                        : "text-gray-400 bg-gray-800 border border-gray-500"
                                                            }
  `}
                                                    >
                                                        {leave.status}
                                                    </div>
                                                </td>
                                                <td className="pt-6 pb-3">
                                                    <div className="flex gap-6 items-center justify-center px-2">
                                                        {leave.status === "pending" && (
                                                            <>
                                                                <svg
                                                                    height="28px"
                                                                    version="1.1"
                                                                    viewBox="0 0 18 15"
                                                                    width="28px"
                                                                    className="cursor-pointer"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => handleStatusUpdate(leave.id, 'approve')}
                                                                >
                                                                    <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
                                                                        <g fill="#ffffff" transform="translate(-423.000000, -47.000000)">
                                                                            <g transform="translate(423.000000, 47.500000)">
                                                                                <path d="M6,10.2 L1.8,6 L0.4,7.4 L6,13 L18,1 L16.6,-0.4 L6,10.2 Z" />
                                                                            </g>
                                                                        </g>
                                                                    </g>
                                                                </svg>

                                                                <svg
                                                                    height="28"
                                                                    viewBox="0 0 16 16"
                                                                    width="28"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                                                    className='cursor-pointer'
                                                                >
                                                                    <polygon
                                                                        fill="white"
                                                                        fillRule="evenodd"
                                                                        points="8 9.414 3.707 13.707 2.293 12.293 6.586 8 2.293 3.707 3.707 2.293 8 6.586 12.293 2.293 13.707 3.707 9.414 8 13.707 12.293 12.293 13.707 8 9.414"
                                                                    />
                                                                </svg>
                                                            </>
                                                        )}
                                                        {leave.status === "approve" && (
                                                            <Check size={28} className="text-green-500" />
                                                        )}

                                                        {leave.status === "rejected" && (
                                                            <X size={28} className="text-red-500" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    <div className="flex justify-end mt-4 text-[#F4F7FF]">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                            {currentPage}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                {add && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full h-full overflow-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl leading-[36px] text-white font-noto">Add leave type</h2>
                                <button
                                    onClick={handleAddMore}
                                    className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                                >
                                    Add another
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {newLeaveTypes.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 p-4 bg-[#222834] rounded"
                                    >
                                        {/* Input Name */}
                                        <div className="flex flex-col">
                                            <label className="text-xs text-[#98A1B3]">Name</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                                className="w-full bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] focus:outline-none"
                                                placeholder="Leave type name"
                                            />
                                        </div>

                                        {/* Switch */}
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                id={`leave-switch-${index}`}
                                                ripple={false}
                                                checked={item.status === "active"}
                                                onChange={() =>
                                                    handleChange(
                                                        index,
                                                        "status",
                                                        item.status === "active" ? "deactive" : "active"
                                                    )
                                                }
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
                                                className={`font-medium text-sm capitalize ${item.status === "active" ? "text-[#19CE74]" : "text-[#FF7E6A]"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>

                                        {/* Remove button (kecuali kalau cuma 1 row) */}
                                        {newLeaveTypes.length > 1 && (
                                            <button
                                                onClick={() => handleRemove(index)}
                                                className="text-sm text-red-400 mt-2 self-start"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 flex-wrap">
                                <button
                                    onClick={async () => {
                                        try {
                                            // kirim banyak sekaligus (loop create atau bikin batch di backend)
                                            await Promise.all(
                                                newLeaveTypes.map((lt) =>
                                                    leaveTypeService.create({ name: lt.name, status: lt.status })
                                                )
                                            );

                                            toast.success("Leave types added successfully");
                                            setAdd(false);
                                            setNewLeaveTypes([{ name: "", status: "active" }]);
                                            fetchLeaves(); // refresh list
                                        } catch (err: any) {
                                            toast.error(err.response?.data?.message || "Failed to add leave types");
                                        }
                                    }}
                                    className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition-all"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setAdd(false)}
                                    className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38] transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </SecondLayout>
    );
};

export default LeaveManagementPage;

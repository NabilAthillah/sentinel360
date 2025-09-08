import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SwitchCustomStyleToggleable } from "../../../components/SwitchCustomStyleToggleable";
import SecondLayout from "../../../layouts/SecondLayout";
import SidebarLayout from "../../../components/SidebarLayout";
import { LeaveManagement } from "../../../types/leaveManagements";
import leaveManagement from "../../../services/leaveManagement";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 5; // jumlah data per page

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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const formatToYMD = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await leaveManagement.getLeaveManagement();
            setLeaves(res.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch leave data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    // Apply filter ke data
    const filteredLeaves = leaves.filter((leave) => {
        const matchSearch =
            search === "" ||
            leave.type?.toLowerCase().includes(search.toLowerCase()) ||
            leave.user?.name?.toLowerCase().includes(search.toLowerCase());

        // const matchSite =
        //     siteFilter === "" || leave.site?.toLowerCase().includes(siteFilter.toLowerCase());

        const matchEmployee =
            employeeFilter === "" ||
            leave.user?.name?.toLowerCase().includes(employeeFilter.toLowerCase());

        const matchStatus =
            statusFilter === "" || leave.status?.toLowerCase() === statusFilter.toLowerCase();

        const matchDate =
            (dateRange.from === "" || new Date(leave.from) >= new Date(dateRange.from)) &&
            (dateRange.to === "" || new Date(leave.to) <= new Date(dateRange.to));

        return matchSearch && matchEmployee && matchStatus && matchDate;
    });

    // Pagination
    const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);
    const paginatedLeaves = filteredLeaves.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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

                        <div className="flex flex-col gap-4 w-full xl:grid xl:grid-cols-4">

                            <input
                                type="text"
                                value={siteFilter}
                                onChange={(e) => setSiteFilter(e.target.value)}
                                placeholder="Filter by site"
                                className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] placeholder:text-[#98A1B3] focus:outline-none rounded"
                            />

                            <input
                                type="text"
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                                placeholder="Filter by employee"
                                className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] placeholder:text-[#98A1B3] focus:outline-none rounded"
                            />
                            <input
                                type="text"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                placeholder="Filter by status"
                                className="w-full px-4 py-2 bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] placeholder:text-[#98A1B3] focus:outline-none rounded"
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">

                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    className="w-full px-2 py-2 bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] rounded"
                                />
                                <span className="text-[#F4F7FF]">to</span>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    className="w-full px-2 py-2 bg-[#222834] text-[#F4F7FF] border-b border-[#98A1B3] rounded"
                                />

                                <button
                                    onClick={() => setDateRange({ from: "", to: "" })}
                                    className="text-sm text-[#EFBF04] px-3 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                                >
                                    {t(' Clear Time')}
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
                                                <td className="text-[#F4F7FF] pt-6 pb-3 text-center">{leave.status}</td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2 absolute bottom-0 right-0">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-1 bg-[#575F6F] text-[#B3BACA] rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 bg-[#D4AB0B] text-[#181D26] rounded">
                                {currentPage}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-1 bg-[#575F6F] text-[#B3BACA] rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
                {add && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full h-full overflow-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl leading-[36px] text-white font-noto">Add leave type</h2>
                                <button className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all">
                                    Add another
                                </button>
                            </div>

                            {/* Input Select */}
                            <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-[#98A1B3] rounded-t">
                                <label className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <select className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none">
                                    <option value="">Annual</option>
                                    <option value="">Sick</option>
                                    <option value="">Hospitalization</option>
                                    <option value="">Compassion</option>
                                    <option value="">Add new type</option>
                                </select>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-4">
                                <SwitchCustomStyleToggleable />
                                <p className="font-medium text-sm text-[#19CE74]">Active</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 flex-wrap">
                                <button
                                    onClick={() => {
                                        setAdd(false);
                                        toast.success("Leave type added successfully");
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

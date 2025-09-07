import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BottomNavBar from "../components/BottomBar";
import { LeaveManagement } from "../../../types/leaveManagements";
import { Site } from "../../../types/site";
import leaveManagement from "../../../services/leaveManagement";
import { toast } from "react-toastify";

const Leaves = () => {
    const [leaves, setLeaves] = useState<LeaveManagement[]>([]);
    const [balance, setBalance] = useState<{ annual: number; sick: number }>({
        annual: 0,
        sick: 0,
    });
    const navigate = useNavigate();
    const { idSite } = useParams<{ idSite: string }>();
    const [nearestSite, setNearestSite] = useState<Site[]>([]);
    const [loading, setLoading] = useState(false);

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

    const fetchBalance = async () => {
        // try {
        //     // const res = await leaveManagement.getBalance();/
        //     setBalance(res.data); 
        // } catch (err: any) {
        //     toast.error("Failed to fetch leave balance");
        // }
    };

    const mapStatus = (status: "active" | "deactive") => {
        if (status === "active") return "Approved";
        if (status === "deactive") return "Rejected";
        return "Cancel";
    };

    useEffect(() => {
        fetchLeaves();
        fetchBalance();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#181D26] gap-6"> <div className="p-6 flex gap-4 pt-12">
            <div className="flex-1 bg-[#46EADF]/5 rounded-xl py-6 px-5 flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_267_24421"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clipPath="url(#master_svg0_267_24421)"><g><path d="M25.3333,4.50016609375L24,4.50016609375L24,3.16682609375C24,2.43349609375,23.4,1.83349609375,22.6667,1.83349609375C21.9333,1.83349609375,21.3333,2.43349609375,21.3333,3.16682609375L21.3333,4.50016609375L10.66667,4.50016609375L10.66667,3.16682609375C10.66667,2.43349609375,10.06667,1.83349609375,9.33333,1.83349609375C8.6,1.83349609375,8,2.43349609375,8,3.16682609375L8,4.50016609375L6.66667,4.50016609375C5.1866699999999994,4.50016609375,4.0133333,5.70016609375,4.0133333,7.16682609375L4,25.83349609375C4,27.30629609375,5.19391,28.50019609375,6.66667,28.50019609375L25.3333,28.50019609375C26.8,28.50019609375,28,27.30019609375,28,25.83349609375L28,7.16682609375C28,5.70016609375,26.8,4.50016609375,25.3333,4.50016609375ZM24,25.83349609375L8,25.83349609375C7.2666699999999995,25.83349609375,6.66667,25.23349609375,6.66667,24.50019609375L6.66667,11.16682609375L25.3333,11.16682609375L25.3333,24.50019609375C25.3333,25.23349609375,24.7333,25.83349609375,24,25.83349609375ZM10.66667,13.83349609375L14.6667,13.83349609375C15.4,13.83349609375,16,14.43349609375,16,15.16679609375L16,19.16679609375C16,19.90019609375,15.4,20.50019609375,14.6667,20.50019609375L10.66667,20.50019609375C9.93333,20.50019609375,9.33333,19.90019609375,9.33333,19.16679609375L9.33333,15.16679609375C9.33333,14.43349609375,9.93333,13.83349609375,10.66667,13.83349609375Z" fill="#46EADF" fillOpacity="1" /></g></g></svg>
                <div className=" gap-2">
                    <p className="text-sm text-[#98A1B3] font-normal ">Annual bal.</p>
                    <p className="text-base font-semibold text-[#F4F7FF]">12 days</p>
                </div>
            </div>
            <div className="flex-1 bg-[#446FC7]/10 rounded-xl py-6 px-5 flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_267_24528"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clipPath="url(#master_svg0_267_24528)"><g><path d="M23.1666259765625,4.5L9.8332959765625,4.5C9.0999559765625,4.5,8.4999559765625,5.1,8.4999559765625,5.83333C8.4999559765625,6.56667,9.0999559765625,7.16667,9.8332959765625,7.16667L23.1666259765625,7.16667C23.8999259765625,7.16667,24.4999259765625,6.56667,24.4999259765625,5.83333C24.4999259765625,5.1,23.8999259765625,4.5,23.1666259765625,4.5ZM23.1666259765625,8.5L9.8332959765625,8.5C8.3666259765625,8.5,7.1666259765625,9.7,7.1666259765625,11.16667L7.1666259765625,25.8333C7.1666259765625,27.3,8.3666259765625,28.5,9.8332959765625,28.5L23.1666259765625,28.5C24.6333259765625,28.5,25.8333259765625,27.3,25.8333259765625,25.8333L25.8333259765625,11.16667C25.8333259765625,9.7,24.6333259765625,8.5,23.1666259765625,8.5ZM19.8333259765625,20.5L18.4999259765625,20.5L18.4999259765625,21.8333C18.4999259765625,22.94,17.606625976562498,23.8333,16.4999559765625,23.8333C15.3932959765625,23.8333,14.4999559765625,22.94,14.4999559765625,21.8333L14.4999559765625,20.5L13.1666259765625,20.5C12.059955976562499,20.5,11.1666259765625,19.6067,11.1666259765625,18.5C11.1666259765625,17.3933,12.059955976562499,16.5,13.1666259765625,16.5L14.4999559765625,16.5L14.4999559765625,15.1667C14.4999559765625,14.06,15.3932959765625,13.16667,16.4999559765625,13.16667C17.606625976562498,13.16667,18.4999259765625,14.06,18.4999259765625,15.1667L18.4999259765625,16.5L19.8333259765625,16.5C20.9399259765625,16.5,21.8333259765625,17.3933,21.8333259765625,18.5C21.8333259765625,19.6067,20.9399259765625,20.5,19.8333259765625,20.5Z" fill="#6091F4" fillOpacity="1" /></g></g></svg>
                <div className=" gap-2">
                    <p className="text-sm text-gray-300">Sick bal.</p>
                    <p className="text-xl font-bold text-white">7 days</p>
                </div>
            </div>
            </div>
            <Link to="/user/leaves/request" className="px-6">
                <button className="w-full bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium text-base">
                    Request leave
                </button>
            </Link>

            <div className="flex-1 flex flex-col">
                <h2 className="text-sm font-medium text-gray-700 pb-4 pl-3">History</h2>
                <div className="flex-1 bg-white rounded-t-2xl p-6 flex flex-col gap-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : leaves.length === 0 ? (
                        <p className="text-center text-gray-400">No leave history</p>
                    ) : (
                        leaves.map((leave) => (
                            <div
                                key={leave.id}
                                className="flex justify-between items-start pb-4 border-b border-gray-200"
                            >
                                <div>
                                    <p className="text-sm font-normal text-[#181D26] pb-2">
                                        {leave.from} - {leave.to}
                                    </p>
                                    <p className="text-xs font-normal text-[#98A1B3] pb-2">
                                        {leave.total} days | {leave.type}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-2 text-xs ${mapStatus(leave.status) === "Approved"
                                        ? "bg-[#3BB678]/10 text-[#3BB678]"
                                        : mapStatus(leave.status) === "Rejected"
                                            ? "bg-[#FF7E6A]/10 text-[#FF7E6A]"
                                            : "border border-[#868686] text-[#868686] rounded-full"
                                        }`}
                                >
                                    {mapStatus(leave.status)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNavBar />
        </div>
    );
};

export default Leaves;

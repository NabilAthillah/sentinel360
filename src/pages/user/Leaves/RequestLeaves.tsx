import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LeaveManagement } from "../../../types/leaveManagements";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Site } from "../../../types/site";
import leaveManagement from "../../../services/leaveManagement";
import { toast } from "react-toastify";

const RequestLeaves = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const token = useSelector((state: RootState) => state.token.token);

    const [selectedType, setSelectedType] = useState("Annual");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [reason, setReason] = useState("");

    const leaveTypes = ["Annual", "Sick", "Hospitalisation", "Compassionate"];
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { idSite } = useParams<{ idSite: string }>();
    const [nearestSite, setNearestSite] = useState<Site[]>([]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!token) {
            navigate("/auth/login");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                type: selectedType,
                from,
                to,
                reason
            };

            console.log("Payload:", {
                type: selectedType,
                from,
                to,
                reason
            });
            const res = await leaveManagement.addLeaveManagement( token , payload);
            toast.success(res.message || "Leave request submitted successfully");

            if (res.data) {
                console.log("Leave baru dibuat:", res.data);
            }

            navigate("/user/leaves");
        } catch (err: any) {
            toast.error(err.message || "Failed to submit leave request");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#181D26] text-white flex flex-col">
            <div className="flex items-center gap-2 p-4 pt-9">
                <Link to="/user/leaves">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Link>
                <h1 className="text-xl text-[#F4F7FF] font-normal">Request leave</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
                <div>
                    <p className="text-sm text-[#98A1B3] pb-4 pl-1">Leave type</p>
                    <div className="flex flex-wrap gap-3">
                        {leaveTypes.map((type) => (
                            <button
                                type="button"
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedType === type
                                    ? "bg-[#4D8DFF] text-[#F4F7FF]"
                                    : "bg-[#2C3440] text-[#F4F7FF]"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Start date"
                    className="bg-[#2C3440] text-gray-300 p-4 rounded-md focus:outline-none w-full border-b"
                />

                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="End date"
                    className="bg-[#2C3440] text-gray-300 p-4 rounded-md focus:outline-none w-full border-b"
                />

                <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="bg-[#2C3440] text-gray-300 p-4 rounded-md focus:outline-none w-full border-b"
                />

                <div className="mt-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestLeaves;

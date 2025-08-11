import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Result = () => {
    const navigate = useNavigate();
    const [remarks, setRemarks] = useState("NA");

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-6 w-full bg-[#181D26]">
                    <ChevronLeft
                        size={20}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-xl font-normal">Clocking</h1>
                </div>

                <p className="text-[#EFBF04] font-semibold mb-1">Kovan Residences</p>

                <div className="mb-4">
                    <p className="text-xs text-[#98A1B3] mb-1">Clocking point</p>
                    <p className="text-sm">New Point One - 1 Top floor</p>
                </div>

                <div className="mb-4">
                    <p className="text-xs text-[#98A1B3] mb-1">Clocking location</p>
                    <p className="text-sm">Basement Tower</p>
                </div>

                <div className="mb-4">
                    <p className="text-xs text-[#98A1B3] mb-1">Clocking date & time</p>
                    <p className="text-sm">14 May 2025, 11:45AM</p>
                </div>

                <div className="mb-4">
                    <p className="text-xs text-[#98A1B3] mb-1">Remarks</p>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-[#252C38] text-[#F4F7FF] rounded-md p-2 text-sm outline-none"
                        rows={2}
                    />
                </div>

                <button className="border border-[#EFBF04] text-[#EFBF04] rounded-full px-6 py-2 text-sm">
                    Upload file
                </button>
            </div>

            <div>
                <button className="w-full bg-[#EFBF04] text-[#181D26] font-medium py-4 rounded-full">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Result;

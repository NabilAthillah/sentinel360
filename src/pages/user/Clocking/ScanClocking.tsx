import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScanClocking = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] flex flex-col justify-between p-4  gap-6 pt-10">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 ">
                    <ChevronLeft
                        size={20}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-xl font-normal">Scan & Clocking</h1>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-[#98A1B3] text-sm mb-1">Route 2</p>
                    <p className="text-[#F4F7FF] text-sm ">
                        14 May 2025, Friday, 1:45AM
                    </p>

                    <button className="border border-[#EFBF04] text-[#EFBF04] rounded-full w-fit px-6 py-2 text-sm">
                        Skip
                    </button>
                </div>
            </div>

            <div className="w-full pb-10">
                <button className="w-full bg-[#EFBF04] text-[#181D26] font-medium py-4 rounded-full">
                    Scan NFC tag
                </button>
            </div>
        </div>
    );
};

export default ScanClocking;

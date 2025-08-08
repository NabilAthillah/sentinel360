import React from "react";
import Map from "../../../components/Map";
import { Link } from "react-router-dom";

const Checkin = () => {
    return (
        <div className="relative flex flex-col h-screen bg-white">
            <div className="flex items-center bg-[#181D26] text-white p-4 pt-12 pb-3 gap-3 z-20">
                <Link to="/user/attendance" >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        fill="none"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Link>
                <h1 className="text-xl font-normal text-[#F4F7FF]">Check in</h1>
            </div>

            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map sites={[]} />
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-white p-6 flex flex-col gap-4 rounded-t-2xl z-10 shadow-lg">
                <div className="flex flex-col gap-1 pt-6">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">
                        137 Lorong Ah Soo, Singapore 530137
                    </p>
                </div>

                <div className="flex flex-col gap-1 pt-6 pb-6">
                    <p className="text-xs text-gray-500">Date & time</p>
                    <p className="text-sm font-medium">
                        14 May 2025, Friday, 11:45AM
                    </p>
                </div>
                
                <button className="bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium ">
                    Continue
                </button>
            </div>
        </div>
    );
};

export default Checkin;

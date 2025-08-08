import React, { useState } from "react";
import { Link } from "react-router-dom";

const RequestLeaves = () => {
    const [selectedType, setSelectedType] = useState("Annual");
    const leaveTypes = ["Annual", "Sick", "Hospitalisation", "Compassionate"];

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

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <p className="text-sm text-[#98A1B3] pb-4 pl-1">Leave type</p>
                    <div className="flex flex-wrap gap-3">
                        {leaveTypes.map((type) => (
                            <button
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
                    type="form"
                    placeholder="Start date"
                    className="bg-[#2C3440] text-gray-300 placeholder-gray-500 p-4 rounded-md focus:outline-none w-full border-b"
                />

                <input
                    type="form"
                    placeholder="End date"
                    className="bg-[#2C3440] text-gray-300 placeholder-gray-500 p-4 rounded-md focus:outline-none w-full border-b"
                />

                <input
                    placeholder="Reason (optional)"
                    className="bg-[#2C3440] text-gray-300 placeholder-gray-500 p-4 rounded-md focus:outline-none w-full  border-b"
                ></input>
            </div>

            <div className="mt-auto p-4">
                <button className="w-full bg-[#EFBF04] text-[#181D26] py-3 rounded-full font-medium">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default RequestLeaves;

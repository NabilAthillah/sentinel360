import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClockingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Sites');

    const historyData = [
        {
            id: 1,
            title: "Condominium",
            date: "14 May 2025, Friday, 11:45AM",
            clockingPoint: "New Point One - 1 Top floor",
            clockingLocation: "Basement Tower",
            remark: "Normal",
        },
        {
            id: 2,
            title: "Condominium",
            date: "14 May 2025, Friday, 11:45AM",
            clockingPoint: "New Point One - 1 Top floor",
            clockingLocation: "Basement Tower",
            remark: "Normal",
        }
    ];

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-6 flex flex-col gap-7 pt-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Clocking</h1>
            </div>

            <div className="flex border-b border-gray-700">
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'Sites'
                            ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]'
                            : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('Sites')}
                >
                    Sites
                </button>
                <button
                    className={`flex-1 pb-2 text-center ${activeTab === 'History'
                            ? 'text-[#F4F7FF] border-b-2 border-[#EFBF04]'
                            : 'text-[#98A1B3]'
                        }`}
                    onClick={() => setActiveTab('History')}
                >
                    History
                </button>
            </div>

            {activeTab === 'Sites' && (
                <div className="flex flex-col items-center justify-center flex-1">
                    <div className="w-40 h-40 bg-[#D8D8D8]/40"></div>
                    <p className="mt-4 text-[#F4F7FF] font-noto">No data available</p>
                </div>
            )}

            {activeTab === 'History' && (
                <div className="flex flex-col gap-4">
                    {historyData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#252C38] p-4 rounded-lg flex flex-col gap-4"
                        >
                            <p className="text-[#EFBF04] font-semibold">{item.title}</p>

                            <div className="text-sm text-[#98A1B3] gap-4 flex flex-col">
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Date & time</p>
                                    <p className="text-[#F4F7FF]">{item.date}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Clocking point</p>
                                    <p className="text-[#F4F7FF]">{item.clockingPoint}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Clocking location</p>
                                    <p className="text-[#F4F7FF]">{item.clockingLocation}</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs">Remark</p>
                                    <p className="text-[#F4F7FF]">{item.remark}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClockingPage;

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import BottomNavBar from '../components/BottomBar';
import { Link } from 'react-router-dom';

const Attendance = () => {
    return (
        <div className=" bg-[#181D26] min-h-screen text-white flex flex-col  justify-between">
            <div className=" rounded-lg pt-16  flex flex-col gap-4 justify-between p-4">
                <div className="flex justify-between items-start ">
                    <div>
                        <h2 className="font-medium text-base">14 May 2025, Friday</h2>
                        <p className="text-sm text-gray-400">08:00 AM – 08:30PM</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-400">
                        <Sun size={16} />
                        <span>Day shift</span>
                    </div>
                </div>

                <div className="flex justify-between text-sm ">
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[#98A1B3] text-xs font-normal ">Check in</p>
                            <p className="text-green-400 font-normal text-xs">02:00PM</p>
                        </div>
                        <div>
                            <p className="text-[#98A1B3] text-xs font-normal">Check out</p>
                            <p className="text-[#FF7E6A]">--:--</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[#98A1B3] text-xs font-normal">Effective hours</p>
                        <p className="text-[#F4F7FF] text-xs font-normal">0h 0m</p>
                    </div>
                </div>

                <Link to="/user/attendance/checkin" className="bg-[#EFBF04] rounded-full flex justify-center items-center mt-6 w-full py-4">
                    <span className='flex text-[#181D26] text-base font-medium gap-2 text-center w-fit '>Let's check out |  02:34:00</span>
                </Link>
            </div>

            <div className='h-full w-full pb-16'>
                <h3 className='text-[#98A1B3] text-base font-normal'>History</h3>
                <div className="bg-white rounded-t-3xl  px-2 py-2 text-[#0F1116]  flex flex-col justify-between">

                    <div className="border-b pb-12">
                        <div className="flex justify-between items-start pt-6">
                            <div>
                                <h4 className="text-sm font-normal underline">14 May 2025, Friday</h4>
                                <p className="text-xs text-[#98A1B3]">08:00 AM – 08:30PM</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#F3C511]">
                                <Sun size={14} />
                                <span className='text-[#181D26] text-xs font-normal'>Day shift</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs pt-2 pb-2">
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Check in</p>
                                <p className="text-[#181D26]">02:00PM</p>
                            </div>
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Check out</p>
                                <p className="text-[#181D26]">09:30PM</p>
                            </div>
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Effective hours</p>
                                <p className="text-[#181D26]">7h 30m</p>
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className='w-fit bg-[#3BB678]/10 px-2 py-1 rounded-full'>
                                <p className=" text-[#3BB678] text-xs font-medium ">
                                    Completed
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='border-b pb-12'>
                        <div className="flex justify-between items-start pt-6">
                            <div>
                                <h4 className="text-sm font-normal underline">03 May 2025, Monday</h4>
                                <p className="text-xs text-[#98A1B3]">08:00 AM – 08:30PM</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#33569F]">
                                <Moon size={14} />
                                <span>Night shift</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs pt-2 pb-2">
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Check in</p>
                                <p className="text-[#181D26]">02:00PM</p>
                            </div>
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Check out</p>
                                <p className="text-[#181D26]">--:--</p>
                            </div>
                            <div>
                                <p className="text-[#98A1B3] text-xs font-normal">Effective hours</p>
                                <p className="text-[#181D26]">7h 30m</p>
                            </div>
                        </div>

                        <div className="pt-2 ">
                            <div className='w-fit bg-[#FF7E6A]/10 px-2 py-1 rounded-full'>
                                <p className=" text-[#FF7E6A] text-xs font-medium ">
                                    Missing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
};

export default Attendance;

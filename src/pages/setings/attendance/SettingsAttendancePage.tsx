import { useState } from "react";
import Header from "../../../components/Header";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

const SettingsAttendancePage = () => {
    const [sidebar, setSidebar] = useState(false);
    const inputData = [
        {
            label: 'Grace period (in minutes)',
            placeholder: 'Grace period (in minutes)',
            value: '15'
        },
        {
            label: 'Geo fencing (in minutes)',
            placeholder: 'Geo fencing (in minutes)',
            value: '200'
        },
        {
            label: 'Day shift start time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'Day shift end time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'Night shift start time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'Night shift end time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'RELIEF Day shift start time',
            placeholder: '00:00',
            value: '08:00'
        },
        {
            label: 'RELIEF Day shift end time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'RELIEF night shift start time',
            placeholder: '00:00',
            value: '20:00'
        },
        {
            label: 'RELIEF night shift end time',
            placeholder: '00:00',
            value: '08:00'
        },
    ]

    return (
        <main className='max-w-screen w-full min-h-screen bg-[#181D26]'>
            <Sidebar isOpen={sidebar} closeSidebar={setSidebar} />
            <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} />
                <div className='flex flex-col gap-4 px-6 pb-6 w-full h-full'>
                    <h2 className='text-2xl leading-9 text-white font-noto'>Settings</h2>
                    <div className="flex flex-col gap-8 w-full h-full">
                        <Navbar />
                        <div className="bg-[#252C38] p-6 rounded-lg w-full h-full">
                            <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
                                {inputData.map((item) => (
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{item.label}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder={item.placeholder}
                                            value={item.value}
                                        />
                                    </div>
                                ))}
                                <div className="flex gap-4 flex-wrap">
                                    <button className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                    <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default SettingsAttendancePage;
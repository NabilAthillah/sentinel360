import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/Navbar";
import MainLayout from "../../../layouts/MainLayout";
import { Client } from "../../../types/client";

const ClientInfoPage = () => {
    const navigate = useNavigate();

    const [client, setClient] = useState<Client>({
        id: '',
        name: '',
        reg_no: '',
        address: '',
        contact: '',
        website: '',
        email: '',
        logo: '',
        chart: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setClient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Settings</h2>
                <div className="flex flex-col gap-8 w-full h-full">
                    <Navbar />
                    <div className="flex gap-6 flex-wrap xl:flex-nowrap">
                        <div className="flex flex-col w-full gap-6 xl:max-w-80">
                            <div className="flex flex-col gap-4 bg-[#252C38] xl:max-w-80 w-full h-fit p-4 rounded-lg">
                                <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">Sentinel Group</p>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Reg. No</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">102838123ER</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Address</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">8 Ubi Ave 10. #04-230, Singapore 21322</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Contact</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">+65 93344768</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Website</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">www.sentinelgp.com</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Email</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">info@sentinelgp.com</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Management chart</label>
                                    <div className="w-[80px] h-[52px] rounded-lg opacity-20 bg-[#D8D8D8]"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 justify-between gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3">
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Sites</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">4</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Employees</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">12</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Asigned</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">10</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Unasigned</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">1</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">On leave</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">1</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Company name</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Company name'
                                        value='Sentinel Group'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Reg No.</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Reg No.'
                                        value='102838123ER'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Adress with postal code</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Adress with postal code'
                                        value='8 Ubi Ave 10. #04-230, Singapore 21322'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Contact</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Contact'
                                        value='+65 93344768'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Website</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Website'
                                        value='www.sentinelgp.com'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Email'
                                        value='info@sentinelgp.com'
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Company logo</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Management chart</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => toast.success('Client info updated successfully')} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default ClientInfoPage;
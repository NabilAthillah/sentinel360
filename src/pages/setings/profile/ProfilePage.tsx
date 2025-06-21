import { useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

const ProfilePage = () => {
    const [sidebar, setSidebar] = useState(false);

    return (
        <main className='max-w-screen w-full min-h-screen bg-[#181D26]'>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />
            <Sidebar isOpen={sidebar} closeSidebar={setSidebar} />
            <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} />
                <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full'>
                    <h2 className='text-2xl leading-9 text-white font-noto'>Profile</h2>
                    <div className="flex gap-6 flex-wrap lg:flex-nowrap">
                        <div className="flex flex-col w-full gap-6 lg:max-w-80">
                            <div className="flex flex-col gap-4 bg-[#252C38] lg:max-w-80 w-full h-fit p-4 rounded-lg">
                                <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">Admin</p>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">NRIC</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">345C</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Company</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">Sentinel Group</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Contact</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">+65 93344768</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Email</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">info@sentinelgp.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Date of birth</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='01/01/1111'
                                        value='25/09/1989'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Mobile'
                                        value='93344768'
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
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Profile photo</label>
                                    <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Old password</label>
                                    <input
                                        type={"password"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='****'
                                        value='***********'
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">New password</label>
                                    <input
                                        type={"password"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='****'
                                        value='***********'
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => toast.success('Profile updates successfully')} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ProfilePage;
import { AlignLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../types/user";

const Header = ({ openSidebar, user, handleLogout }: { openSidebar: any, user: User | null, handleLogout: any }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    return (
        <nav className='w-full bg-transparent p-6 flex items-center justify-between z-40 md:justify-end relative sm:gap-4'>
            <AlignLeft onClick={() => openSidebar(true)} color="#ffffff" className="cursor-pointer md:hidden" />
            <div className="flex items-center justify-end gap-1 relative sm:gap-4"> <div className='flex items-center gap-1 cursor-pointer' onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="relative flex w-fit">
                    <div className="w-[14px] h-[14px] bg-[#22CAAD] border-2 border-[#07080B] rounded-full absolute bottom-[-2px] right-[-2px]"></div>
                    {user?.profile_image ? (
                        <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${user?.profile_image}`} alt="profile" className='h-8 w-8 rounded-full object-cover' />
                    ) : (
                        <img src={user?.profile_image ? user?.profile_image : "/images/profile.png"} alt="" className='profile' />
                    )}
                </div>
                <div className='flex flex-col gap-[2px]'>
                    <p className="text-sm text-white">{user?.name}</p>
                    <p className="text-xs leading-[21px] text-[#A3A9B6]">{user?.role.name}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_21343"><rect x="3" y="3" width="18" height="18" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_323_21343)"><g><path d="M7.810527065124512,9.75C7.810527065124512,9.75,16.189527065124512,9.75,16.189527065124512,9.75C16.33783706512451,9.7500316682,16.48281706512451,9.7940353,16.60611706512451,9.876448C16.72942706512451,9.958862,16.82553706512451,10.075984,16.882287065124512,10.213009C16.93903706512451,10.350033,16.953887065124512,10.500807,16.924967065124513,10.646272C16.89603706512451,10.79174,16.824637065124513,10.92536,16.71977706512451,11.03025C16.71977706512451,11.03025,12.530277065124512,15.21974,12.530277065124512,15.21974C12.389627065124511,15.36034,12.198897065124513,15.43933,12.000027065124511,15.43933C11.801157065124512,15.43933,11.610427065124512,15.36034,11.46977706512451,15.21974C11.46977706512451,15.21974,7.280277065124512,11.03025,7.280277065124512,11.03025C7.175420065124512,10.92536,7.104015265124512,10.79174,7.075089665124512,10.646272C7.046163965124512,10.500807,7.061016407124511,10.350033,7.117768965124512,10.213009C7.1745210651245115,10.075984,7.270626065124512,9.958862,7.393933065124512,9.876448C7.517241065124511,9.7940353,7.662215065124512,9.7500316682,7.810527065124512,9.75Z" fill="#A3A9B6" fill-opacity="1" /></g></g></g></svg>
                {dropdownOpen && (
                    <div className="min-w-[200px] px-6 py-4 bg-[#252C38] rounded-lg flex flex-col gap-4 absolute bottom-[-138px] right-[8px] transition-all">
                        <Link to='/dashboard/settings/profile' className="text-[#F4F7FF] hover:underline">Profile</Link>
                        <Link to='/dashboard/settings/attendance' className="text-[#F4F7FF] hover:underline">Master Settings</Link>
                        <p onClick={handleLogout} className="text-[#F4F7FF] hover:underline">Logout</p>
                    </div>
                )}
            </div>
            </div>
        </nav>
    )
}

export default Header
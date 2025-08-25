import React from 'react';
import { Home, Timer, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavBar = () => {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        if (path === '/user/settings') {
            return location.pathname.startsWith('/user/settings')
                ? 'text-[#EFBF04]'
                : 'text-[#A1A1AA]';
        }       return location.pathname === path
            ? 'text-[#EFBF04]'
            : 'text-[#A1A1AA]';
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1D23] text-white flex justify-around items-center h-16 border-t border-gray-700 z-50">

            <Link to="/user" className={`flex flex-col items-center ${getLinkClass('/user')}`}>
                <Home size={20} />
                <span className="text-xs mt-1">Home</span>
            </Link>

            <Link to="/user/attendance" className={`flex flex-col items-center ${getLinkClass('/user/attendance')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="21" height="21" viewBox="0 0 21 21">
                    <path d="M16.625,5.25H15.75V0.875H5.25V5.25H4.375C3.4125,5.25,2.625,6.0375,2.625,7V17.5C2.625,18.4625,3.4125,19.25,4.375,19.25H16.625C17.5875,19.25,18.375,18.4625,18.375,17.5V7C18.375,6.0375,17.5875,5.25,16.625,5.25ZM7,2.625H14V5.25H7V2.625ZM16.625,17.5H4.375V7H16.625V17.5Z" fill="currentColor" />
                    <path d="M10.5,16.625C12.915,16.625,14.875,14.665,14.875,12.25C14.875,9.835,12.915,7.875,10.5,7.875C8.085,7.875,6.125,9.835,6.125,12.25C6.125,14.665,8.085,16.625,10.5,16.625ZM10.5,9.1875C12.1888,9.1875,13.5625,10.5612,13.5625,12.25C13.5625,13.9387,12.1888,15.3125,10.5,15.3125C8.81125,15.3125,7.4375,13.9387,7.4375,12.25C7.4375,10.5612,8.81125,9.1875,10.5,9.1875Z" fill="currentColor" />
                    <path d="M12.1188,13.2475L10.9375,12.0663V10.0625H10.0625V12.4338L11.4975,13.8688L12.1188,13.2475Z" fill="currentColor" />
                </svg>
                <span className="text-xs mt-1">Attendance</span>
            </Link>

            <Link
                to="/user/settings"
                className={`flex flex-col items-center ${getLinkClass('/user/settings')}`}
            >
                <Settings size={20} />
                <span className="text-xs mt-1">Settings</span>
            </Link>

        </nav>
    );
};

export default BottomNavBar;

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
    const location = useLocation();
    const { pathname } = location;

    return (
        <nav className='flex flex-wrap'>
            <Link to="/settings/attendance" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/attendance' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Attendance
            </Link>
            <Link to="/settings/client-info" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/client-info' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Client info
            </Link>
            <Link to="/settings/employee-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/employee-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Employee Document
            </Link>
            <Link to="/settings/incident" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/incident' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Incident
            </Link>
            <Link to="/settings/occurrence-catg" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/occurrence-catg' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Occurence Catg.
            </Link>
            <Link to="/settings/roles" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/roles' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                Roles
            </Link>
            <Link to="/settings/sop-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/sop-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                SOP Document
            </Link>
        </nav>
    )
}

export default Navbar
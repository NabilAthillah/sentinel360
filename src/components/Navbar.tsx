import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { RootState } from '../store';

const Navbar = () => {
    const location = useLocation();
    const { pathname } = location;
    const user = useSelector((state: RootState) => state.user.user);

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    return (
        <nav className='flex flex-wrap'>
            {hasPermission('show_attendance_settings') && (
                <Link to="/settings/attendance" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/attendance' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Attendance
                </Link>
            )}
            {hasPermission('show_client') && (
                <Link to="/settings/client-info" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/client-info' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Client info
                </Link>
            )}
            {hasPermission('list_employee_documents') && (
                <Link to="/settings/employee-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/employee-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Employee Document
                </Link>
            )}
            {hasPermission('list_incident_type') && (
                <Link to="/settings/incident" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/incident' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Incident
                </Link>
            )}
            {hasPermission('list_occurrence_categories') && (
                <Link to="/settings/occurrence-catg" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/occurrence-catg' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Occurence Catg.
                </Link>
            )}
            {hasPermission('list_roles') && (
                <Link to="/settings/roles" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/roles' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Roles
                </Link>
            )}
            {hasPermission('list_sop_documents') && (
                <Link to="/settings/sop-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/settings/sop-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    SOP Document
                </Link>
            )}
        </nav>
    )
}

export default Navbar
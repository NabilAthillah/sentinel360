import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { RootState } from '../store';

const Navbar = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { pathname } = location;
    const user = useSelector((state: RootState) => state.user.user);
    const initialLang = localStorage.getItem("lang") || "en";
    const [language, setLanguage] = useState(initialLang);

    useEffect(() => {
        i18n.changeLanguage(initialLang);
    }, [i18n, initialLang]);
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");

        if (savedLang) {
            setLanguage(savedLang);
            i18n.changeLanguage(savedLang);
        } else if (user?.language) {
            setLanguage(user.language);
            localStorage.setItem("lang", user.language);
            i18n.changeLanguage(user.language);
        }
    }, [user, i18n]);
    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    return (
        <nav className='flex flex-wrap'>
            {hasPermission('show_attendance_settings') && (
                <Link to="/dashboard/settings/attendance" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/attendance' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Attendance')}
                </Link>
            )}
            {hasPermission('show_client') && (
                <Link to="/dashboard/settings/client-info" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/client-info' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Client Info')}
                </Link>
            )}
            {hasPermission('list_employee_documents') && (
                <Link to="/dashboard/settings/employee-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/employee-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    Employee Document
                </Link>
            )}

            {hasPermission('list_incident_types') && (
                <Link to="/dashboard/settings/incident" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/incident' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Incident')}
                </Link>
            )}

            {hasPermission('list_occurrence_categories') && (
                <Link to="/dashboard/settings/occurrence-catg" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/occurrence-catg' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Occurrence Catg')}
                </Link>
            )}
            {hasPermission('list_roles') && (
                <Link to="/dashboard/settings/roles" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/roles' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Roles')}
                </Link>
            )}
            {hasPermission('list_sop_documents') && (
                <Link to="/dashboard/settings/sop-document" className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === '/dashboard/settings/sop-document' ? 'pt-[14px] pb-3 border-b-2 border-b-[#F3C511]' : 'py-[14px] border-b-0'}`}>
                    {t('Sop Document')}
                </Link>
            )}
        </nav>
    )
}

export default Navbar
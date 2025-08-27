import '../i8n/i18n';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from 'react-toastify';
import authService from "../services/authService";
import HeaderLayout from '../components/HeaderLayout';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearUser, setUser } from '../features/user/userSlice'; // pastikan ada action setUser

const SecondLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebar, setSidebar] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();
    const { pathname } = location;
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(clearUser()); // reset redux user
        toast.success("Logout successful!");
        navigate("/auth/login");
    };

    const isToday = (dateString: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        return (
            date.getUTCFullYear() === now.getUTCFullYear() &&
            date.getUTCMonth() === now.getUTCMonth() &&
            date.getUTCDate() === now.getUTCDate()
        );
    };

    const checkLastLogin = (lastLogin?: string) => {
        if (lastLogin && isToday(lastLogin)) {
            const notifShown = localStorage.getItem('notif_last_login');
            if (!notifShown || notifShown === 'false') {
                toast.warning('You must change your password every 3 months!');
                localStorage.setItem('notif_last_login', 'true');
            }
        }
    };

    const checkTokenAndRole = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first!");
            navigate("/auth/login");
            return;
        }

        try {
            const response = await authService.checkToken(token);

            if (response.success && response.user) {
                dispatch(setUser(response.user)); // FIX: gunakan redux

                // hanya admin yang boleh masuk layout
                if (
                    response.user.role.name !== "Admin" &&
                    response.user.role.name !== "Administrator"
                ) {
                    toast.error("Forbidden area. You will be logged out.");
                    handleLogout();
                    return;
                }

                checkLastLogin(response.user.last_login);
            } else {
                toast.error("Session expired. Please login again.");
                handleLogout();
            }
        } catch (error) {
            console.error(error);
            toast.error("Session expired. Please login again.");
            handleLogout();
        }
    };

    const titleHeader = () => {
        switch (pathname) {
            case "/dashboard/employees":
                return t("Employees");
            case "/dashboard/attendances":
                return t("Attendances");
            case "/dashboard/e-occurrences":
                return t("E-Occurrences");
            case "/dashboard/incidents":
                return t("Incidents");
            case "/dashboard/sites":
                return t("Sites");
            case "/dashboard/sites/map":
                return t("Site Map");
            case "/dashboard/sites/allocation":
                return t("Allocation List");
            case "/dashboard/reports":
                return t("Reports");
            case "/dashboard/guard-tours":
                return t("Guard Tours");
            case "/dashboard/audit-trails":
                return t("Audit Trails");
            case "/dashboard/settings/profile":
                return t("Profile");
            default:
                return "";
        }
    };

    useEffect(() => {
        checkTokenAndRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className='max-w-screen w-full min-h-screen h-full bg-[#181D26]'>
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
            <SidebarLayout
                isOpen={sidebar}
                closeSidebar={setSidebar}
            />
            <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen h-full transition-all duration-200 md:pl-[265px]'>
                <HeaderLayout
                    title={titleHeader()}
                    openSidebar={setSidebar}
                    handleLogout={handleLogout}
                    user={user}
                />
                {children}
            </div>
        </main>
    );
};

export default SecondLayout;

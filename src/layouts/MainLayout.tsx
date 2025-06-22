import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { setUser } from '../lib/redux/reducer/userSlice';

type User = {
    id: string;
    name: string;
    mobile: string;
    address?: string;
    profile_image?: string;
    email: string;
    status: string;
    role: Role;
};

type Role = {
    id: string;
    name: string;
    permissions: Permission[];
};

type Permission = {
    name: string;
    category: string;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebar, setSidebar] = useState(false);
    const navigate = useNavigate();
    const [user, setUserState] = useState<User>();
    const dispatch = useDispatch();

    const handleLogout = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.success('Logout successfully');
        navigate('/login');
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token || userData) {
            axios.get(process.env.REACT_APP_API_URL || 'http://localhost:8000/api/check-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => {
                    const parsedUser = res.data.user ? res.data.user : null;

                    if (!parsedUser || !parsedUser.id) {
                        localStorage.clear();
                        navigate('/login');
                        return;
                    }

                    setUserState(parsedUser);
                    dispatch(setUser(parsedUser));
                })
                .catch((err) => {
                    navigate('/login')
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                });
        } else {
            navigate('/login')
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [navigate])

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
            <Sidebar isOpen={sidebar} closeSidebar={setSidebar} user={user} />
            <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} user={user} handleLogout={handleLogout} />
                {children}
            </div>
        </main>
    );
};

export default MainLayout;

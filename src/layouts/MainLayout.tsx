import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User } from '../types/user';
import { clearUser } from '../features/user/userSlice';
import { RootState } from '../store';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebar, setSidebar] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch();

    const handleLogout = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        dispatch(clearUser());
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.success('Logout successfully');
        navigate('/login');
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token || userData) {
            axios.get(`${process.env.REACT_APP_API_URL}/check-token` || 'http://localhost:8000/api/check-token', {
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
            <Sidebar isOpen={sidebar} closeSidebar={setSidebar} user={user} />
            <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen h-full transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} user={user} handleLogout={handleLogout} />
                {children}
            </div>
        </main>
    );
};

export default MainLayout;

import '../i8n/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { clearUser } from '../features/user/userSlice';
import { RootState } from '../store';
import { clearToken } from '../features/user/tokenSlice';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebar, setSidebar] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const token = useSelector((state: RootState) => state.token.token);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        dispatch(clearUser());
        dispatch(clearToken());
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.success('Logout successfully');
        navigate('/auth/login');
    }

    useEffect(() => {
        if (!token || !user) return;


        if (token || user) {
            axios.get(`${process.env.REACT_APP_API_URL}/check-token` || 'http://localhost:8000/api/check-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => {
                    const parsedUser = res.data.user ? res.data.user : null;

                    if (!parsedUser || !parsedUser.id) {
                        localStorage.clear();
                        navigate('/auth/login');
                        return;
                    }
                })
                .catch((err) => {
                    navigate('/auth/login')
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                });
        } else {
            navigate('/auth/login')
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
            {/* <Sidebar isOpen={sidebar} closeSidebar={setSidebar} user={user} /> */}
            {/* <div className='flex flex-col max-w-screen w-full pl-0 min-h-screen h-full transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} user={user} handleLogout={handleLogout} />
                {children}
            </div> */}
            <div className='flex flex-col max-w-screen w-full min-h-screen h-full transition-all duration-200'>
                <Header openSidebar={setSidebar} user={user} handleLogout={handleLogout} />
                <div className="flex-1 p-6 max-w-screen w-full min-h-screen h-full">{children}</div>
            </div>
        </main>
    );
};

export default MainLayout;

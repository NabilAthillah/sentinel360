import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import authService from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/user/userSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => {
    setShowPassword((prev: any) => !prev);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('')

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        dispatch(setUser(response.data.user));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        toast.success('Login successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      axios.get(`${process.env.REACT_APP_API_URL}/check-token` || 'http://localhost:8000/api/check-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          navigate('/dashboard');
        })
        .catch((err) => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [navigate])

  return (
    <div className='max-w-screen w-full h-screen bg-[#181D26] flex flex-col justify-center items-center gap-32 px-5 sm:px-0'>
      <img src="/images/logo.png" alt="" className='max-w-60 w-full' />
      <form className='max-w-[400px] w-full flex flex-col gap-6' onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder='Email'
          className='w-full px-4 pt-[17.5px] pb-[10.5px] text-[#F4F7FF] text-base bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px] placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none'
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
            placeholder="Masukkan password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={togglePassword}
            className="p-2 rounded-[4px_4px_0px_0px]"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={20} color="#98A1B3" style={{ backgroundColor: "#222834", borderRadius: "4px" }} />
            ) : (
              <Eye size={20} color="#98A1B3" style={{ backgroundColor: "#222834", borderRadius: "4px" }} />
            )}
          </button>
        </div>
        <button type="submit" onClick={handleSubmit} className='w-full flex justify-center items-center py-4 text-center text-[#181D26] font-medium bg-[#EFBF04] border-[1px] border-[#EFBF04] rounded-full transition-all hover:text-[#EFBF04] hover:bg-[#181D26]'>
          {loading ? <Loader /> : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

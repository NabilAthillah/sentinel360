import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword((prev: any) => !prev);
  };

  const handleSubmit = async () => {
    navigate('/dashboard')
  }

  return (
    <div className='max-w-screen w-full h-screen bg-[#181D26] flex flex-col justify-center items-center gap-32 px-5 sm:px-0'>
      <img src="/images/logo.png" alt="" className='max-w-60 w-full' />
      <div className='max-w-[400px] w-full flex flex-col gap-6'>
        <input type="email" placeholder='Email' className='w-full px-4 pt-[17.5px] pb-[10.5px] text-[#F4F7FF] text-base bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px] placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none' />
        <div className="w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
            placeholder="Masukkan password"
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
        <button type="submit" onClick={handleSubmit} className='w-full py-4 text-center text-[#181D26] font-medium bg-[#EFBF04] border-[1px] border-[#EFBF04] rounded-full transition-all hover:text-[#EFBF04] hover:bg-[#181D26]'>Login</button>
      </div>
    </div>
  );
};

export default LoginPage;

import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Incident = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#181D26] text-white flex flex-col pt-20">

            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Incident</h1>
            </div>
            <div className='flex flex-col flex-1 justify-center items-center w-full'>
                <img src="/images/Incident.png" alt="" className='w-1/2 ' />
            </div>

            <div className='flex flex-col gap-4 justify-center items-center px-6 w-full py-10'>

                <Link to="/user/incident/history" className='gap-3 w-full border py-3 border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center'>
                    <p>History</p>
                </Link>


                <Link to="/user/incident/report" className='gap-3 w-full py-3  bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center'>
                    <p>Report</p>
                </Link>
            </div>
        </div>
    )
}

export default Incident
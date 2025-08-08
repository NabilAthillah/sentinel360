import { ChevronLeft } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Incident = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#181D26] text-white flex flex-col gap-32 ">

            <div className="flex items-center gap-2 p-4 pt-9">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="">Incident</h1>
            </div>
            <div className='flex flex-row justify-center items-center'>
                <img src="/images/Incident.png" alt="" className='w-1/2 ' />
            </div>

            <div className='flex flex-col gap-4 justify-center items-center p-6 pt-24'>

                <Link to="/user/incident/history" className=' gap-3 w-full py-3 border border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center py-3'>
                    <p>History</p>
                </Link>


                <Link to="/user/incident/report" className=' gap-3 w-full py-3  bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center py-3'>
                    <p>Report</p>
                </Link>
            </div>
        </div>
    )
}

export default Incident
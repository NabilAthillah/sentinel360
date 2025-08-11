import { ChevronLeft, ClipboardList } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const EmployeeDocument = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 pt-4">
                <div className="flex items-center gap-3 w-full bg-[#181D26]">
                    <ChevronLeft
                        size={20}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-xl text-[#F4F7FF] font-normal">Employee Document</h1>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center px-4">

                <div className="bg-[#FFFFFF1A] p-6 rounded-2xl mb-6">
                    <ClipboardList size={40} className="text-white" />
                </div>

                <h2 className="text-lg font-medium">
                    Employee documents will be available here
                </h2>
                <p className="text-[#98A1B3] mt-1">
                    Check back later for important documents and forms
                </p>
            </div>
        </div>
    )
}

export default EmployeeDocument
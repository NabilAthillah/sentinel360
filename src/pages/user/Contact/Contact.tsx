import React from "react";
import { ArrowLeft, ChevronLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
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
          <h1 className="text-xl text-[#F4F7FF] font-normal">Contact</h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">

        <div className="bg-[#FFFFFF1A] p-6 rounded-2xl mb-6">
          <ClipboardList size={40} className="text-white" />
        </div>

        <h2 className="text-lg font-medium">
          Contact directory will be available here
        </h2>
        <p className="text-gray-400 mt-1">
          Find important contacts and emergency numbers
        </p>
      </div>
    </div>
  );
};

export default Contact;

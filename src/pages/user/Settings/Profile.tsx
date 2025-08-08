import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavBar from "../components/BottomBar";

const Profile = () => {
    const navigate = useNavigate();

    const profileData = {
        name: "Admin",
        mobile: "98299213",
        email: "admin@pavo.com",
        dob: "02/10/1990",
        nric: "S7892108C",
        role: "Administrator",
    };

    const FormField = ({ label, type = "text", defaultValue }: { label: string; type?: string; defaultValue?: string }) => (
        <div className="flex flex-col gap-1 bg-[#222630]  w-full  p-3 border-b rounded-md outline-none">
            <label className="text-xs text-[#98A1B3]">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3]"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-8">
            <div className="flex items-center gap-3 pt-8">
                <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                <h1 className="text-xl font-normal text-[#F4F7FF]">Profile</h1>
            </div>

            <div className="flex flex-col gap-6">
                <FormField label="Name" defaultValue={profileData.name} />
                <FormField label="Mobile number" defaultValue={profileData.mobile} />
                <FormField label="Email" type="email" defaultValue={profileData.email} />
                <FormField label="Date of birth" defaultValue={profileData.dob} />
                <FormField label="NRIC/FIN" defaultValue={profileData.nric} />
                <FormField label="Role" defaultValue={profileData.role} />
            </div>

            <button className="pt-4 bg-[#FFC107] text-[#181D26] font-medium text-base py-3 rounded-full">
                Save
            </button>

            <BottomNavBar />
        </div>
    );
};

export default Profile;

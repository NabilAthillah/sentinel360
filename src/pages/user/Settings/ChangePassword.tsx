import React, { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-5">
            <div className="flex items-center gap-3 pt-8">
                <ChevronLeft
                    size={20}
                    className="cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl font-normal text-[#F4F7FF]">
                    Change Password
                </h1>
            </div>

            <div className="flex flex-col gap-4 mt-4 ">
                <div className="relative w-full border-b">
                    <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="peer w-full bg-[#222630] p-3 pt-5 rounded-md outline-none text-[#F4F7FF] placeholder-transparent"
                        placeholder="New password"
                    />
                    <label
                        htmlFor="new-password"
                        className="absolute left-3 text-[#98A1B3] transition-all duration-200 pointer-events-none
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
                        peer-focus:top-1 peer-focus:text-xs"
                    >
                        New password
                    </label>
                    <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#98A1B3]"
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                </div>

                <div className="relative w-full border-b">
                    <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="peer w-full bg-[#222630] p-3 pt-5 rounded-md outline-none text-[#F4F7FF] placeholder-transparent"
                        placeholder="Confirm password"
                    />
                    <label
                        htmlFor="confirm-password"
                        className="absolute left-3 text-[#98A1B3] transition-all duration-200 pointer-events-none
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
                        peer-focus:top-1 peer-focus:text-xs"
                    >
                        Confirm password
                    </label>
                    <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#98A1B3]"
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                </div>
            </div>

            <div className="mt-auto pb-12">
                <button className="w-full bg-[#FFC107] text-black font-medium py-3 rounded-full">
                    Save
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;

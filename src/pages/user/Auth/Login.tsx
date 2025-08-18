import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../components/Loader";
import { setUser } from "../../../features/user/userSlice";
import authService from "../../../services/authService";

const Login: React.FC = () => {
    const [onboardingDone, setOnboardingDone] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 2;
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const done = localStorage.getItem("onboarding_done") === "true";
            setOnboardingDone(done);
        }
    }, []);

    const handleNext = () => {
        localStorage.setItem("onboarding_done", "true");
        setOnboardingDone(true);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.loginUser(phone, password);

            if (response.success) {
                dispatch(setUser(response.data.user));
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                toast.success("Login successfully");
                navigate("/user");
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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

            {!onboardingDone && (
                <div className="w-screen h-screen bg-[#181D26] text-white fixed top-0 left-0 z-50 flex flex-col gap-16 items-center justify-center px-6">
                    <img
                        src="/images/onboarding.png"
                        alt="onboarding"
                        className="w-1/2 mb-16"
                    />
                    <p className="text-lg text-center text-[#F8FAFF] mb-10 max-w-md font-bold">
                        Enhances real-time surveillance by detecting intrusions, people
                        counting & more
                    </p>

                    <div className="flex flex-col items-center gap-20">
                        <div className="flex space-x-2 mb-8">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${index === currentStep ? "bg-yellow-500" : "bg-gray-500"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="bg-[#F4C430] text-black text-lg font-bold py-2 px-12 rounded-full"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {onboardingDone && (
                <div className="h-screen flex items-center justify-center bg-[#0B0E1C] flex-col gap-5">
                    <img
                        src="/images/login.png"
                        alt="login"
                        className="w-[375px] mb-24"
                    />

                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-sm px-6 flex flex-col gap-16"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Mobile Number */}
                            <div className="w-full py-1 p-4 text-lg rounded bg-[#1B1E2B] text-white border-b border-white focus-within:border focus-within:border-white gap-1">
                                <label className="block text-[#98A1B3] text-sm">
                                    Mobile number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Ex. +1234567890"
                                    required
                                    className="bg-[#1B1E2B] w-full text-base outline-none border-none"
                                />
                            </div>

                            {/* Password */}
                            <div className="w-full py-1 p-4 text-lg rounded bg-[#1B1E2B] text-white border-b border-white focus-within:border focus-within:border-white relative">
                                <label className="block text-[#98A1B3] text-sm mb-1">
                                    Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full text-base bg-[#1B1E2B] outline-none border-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff size={22} color="#98A1B3" />
                                    ) : (
                                        <Eye size={22} color="#98A1B3" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#F4C430] text-black font-bold py-3 px-4 rounded-2xl mt-4 flex justify-center disabled:opacity-70"
                        >
                            {loading ? <Loader primary={true} /> : "Login"}
                        </button>
                    </form>
                </div>
            )}

        </>
    );
};

export default Login;

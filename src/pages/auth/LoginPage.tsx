import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import SecondLayout from "../../layouts/SecondLayout";
import SidebarLayout from "../../components/SidebarLayout";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { User } from "../../types/user";

const ProfilePage = () => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [sidebar, setSidebar] = useState(true);
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>();

    const [newData, setNewData] = useState({
        name: "",
        address: "",
        mobile: "",
        email: "",
        nric_fin_no: "",
        profile_image: "",
        old_password: "",
        new_password: "",
    });

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logout successful!");
        window.location.href = "/auth/login";
    };

    const checkTokenAndRole = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first!");
            handleLogout();
            return;
        }

        try {
            const response = await authService.checkToken(token);
            if (response.success && response.user) {
                const user = response.user;

                if (user.role.name !== "Admin" && user.role.name !== "Administrator") {
                    toast.error("Forbidden area. You will be logged out.");
                    handleLogout();
                    return;
                }

            } else {
                toast.error("Session expired. Please login again.");
                handleLogout();
            }
        } catch (error) {
            console.error(error);
            toast.error("Session expired. Please login again.");
            handleLogout();
        }
    };

    useEffect(() => {
        const data = localStorage.getItem("user");

        if (!data) {
            handleLogout();
            return;
        } else {
            const user = JSON.parse(data);
            setUser(user);
            setNewData({
                name: user.name || "",
                address: user.address || "",
                mobile: user.mobile || "",
                email: user.email || "",
                nric_fin_no: user.nric_fin_no || "",
                profile_image: user.profile_image || "",
                old_password: "",
                new_password: "",
            });
        }
        
        checkTokenAndRole();
    }, []);

    const baseURL = new URL(process.env.REACT_APP_API_URL || "http://localhost:8000/");
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let base64Image = null;

            if (imageFile) {
                base64Image = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(imageFile);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
            }

            const payload = {
                name: newData.name,
                address: newData.address,
                mobile: newData.mobile,
                email: newData.email,
                old_password: newData.old_password || undefined,
                new_password: newData.new_password || undefined,
                profile_image: base64Image,
            };

            const response = await authService.updateProfile(payload, user?.id);

            if (response.success) {
                toast.success("Profile updated successfully");
                setNewData(prev => ({ ...prev, old_password: "", new_password: "" }));
                checkTokenAndRole();

            } else {
                toast.error(response.message || "Failed to update profile");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SecondLayout>
            <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
            <div className="flex flex-col gap-4 px-6 pb-20 w-full h-full flex-1">
                {!user ? (<Loader primary={true} />) : (
                    <div className="flex gap-6 flex-wrap justify-center flex-1 lg:flex-nowrap">
                        <div className="flex flex-col w-full gap-6 lg:max-w-80">
                            <div className="flex flex-col gap-4 bg-[#252C38] lg:max-w-80 w-full h-fit p-4 rounded-lg">
                                <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">
                                    {user.name}
                                </p>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#98A1B3]">{t("NRIC")}</label>
                                    <p className="text-base text-[#F4F7FF]">
                                        {user.nric_fin_no}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#98A1B3]">{t("Company")}</label>
                                    <p className="text-base text-[#F4F7FF]">Sentinel Group</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#98A1B3]">{t("Role")}</label>
                                    <p className="text-base text-[#F4F7FF]">{user.role.name}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#98A1B3]">{t("Contact")}</label>
                                    <p className="text-base text-[#F4F7FF]">{user.mobile}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#98A1B3]">{t("Email")}</label>
                                    <p className="text-base text-[#F4F7FF]">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="w-full lg:max-w-[552px] p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8"
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("Name")}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        value={newData.name}
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("Address")}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        value={newData.address}
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, address: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("Mobile")}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        value={newData.mobile}
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, mobile: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("Email")}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        value={newData.email}
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, email: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("Old Password")}</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, old_password: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                                    <label className="text-xs text-[#98A1B3]">{t("New Password")}</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base border-none focus:outline-none"
                                        onChange={(e) =>
                                            setNewData((prev) => ({ ...prev, new_password: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs text-[#98A1B3]">
                                    {t("Profile photo")} <span className="text-xs">({t("Maximum Size is 5MB")}!)</span>
                                </label>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full"
                                    >
                                        {t("Upload File")}
                                    </button>

                                    {imageName && (
                                        <span className="text-sm text-[#98A1B3]">{imageName}</span>
                                    )}
                                </div>

                                {imageFile ? (
                                    <img
                                        src={URL.createObjectURL(imageFile)}
                                        alt="Preview"
                                        className="h-20 w-fit rounded"
                                    />
                                ) : (
                                    <img
                                        src={`${baseURL.toString()}storage/${newData.profile_image}`}
                                        alt="Profile"
                                        className="h-14 w-fit"
                                    />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageInputRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const maxSize = 5 * 1024 * 1024;
                                            if (file.size > maxSize) {
                                                toast.warning("Maximum file size is 5MB!");
                                                e.target.value = "";
                                                return;
                                            }
                                            setImageName(file.name);
                                            setImageFile(file);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button
                                    type="submit"
                                    className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full"
                                >
                                    {loading ? <Loader primary={true} /> : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full"
                                >
                                    {t("Cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </SecondLayout>
    );
};

export default ProfilePage;

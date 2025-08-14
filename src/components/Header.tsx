import { AlignLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "../types/user";
import languageService from "../services/languageService";

const Header = ({ openSidebar, user, handleLogout }: { openSidebar: any, user: User | null, handleLogout: any }) => {
    const { t, i18n } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [language, setLanguage] = useState(localStorage.getItem("lang") || user?.language || "en");

    const dropdownRef = useRef<HTMLDivElement>(null);
    const baseURL = new URL(process.env.REACT_APP_API_URL || "");
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");

    useEffect(() => {
        if (user?.language) {
            setLanguage(user.language);
            localStorage.setItem("lang", user.language);
            i18n.changeLanguage(user.language);
        }
    }, [user, i18n]);

    const handleLanguageChange = async (lang: string) => {
        setLanguage(lang);
        localStorage.setItem("lang", lang);
        i18n.changeLanguage(lang);
        setLangDropdownOpen(false);

        try {
            if (user?.id) {
                const token = localStorage.getItem("token"); 
                await languageService.editLanguage(token, user.id, lang);
                console.log("Language updated to:", lang);
            }
        } catch (err) {
            console.error("Failed to update language", err);
        }
    };


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="w-full bg-transparent p-6 flex items-center justify-between z-40 md:justify-end relative sm:gap-4">
            <AlignLeft onClick={() => openSidebar(true)} color="#ffffff" className="cursor-pointer md:hidden" />

            <div ref={dropdownRef} className="flex items-center justify-end gap-1 relative sm:gap-4">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="relative flex w-fit">
                        <div className="w-[14px] h-[14px] bg-[#22CAAD] border-2 border-[#07080B] rounded-full absolute bottom-[-2px] right-[-2px]"></div>
                        {user?.profile_image ? (
                            <img
                                src={`${baseURL.toString() !== "" ? baseURL.toString() : "http://localhost:8000/"}storage/${user?.profile_image}`}
                                alt="profile"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <img src="/images/profile.png" alt="" className="profile" />
                        )}
                    </div>
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-sm text-white">{user?.name}</p>
                        <p className="text-xs leading-[21px] text-[#A3A9B6]">{user?.role.name}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M7.8 9.75h8.38a.75.75 0 0 1 .49 1.28l-4.19 4.19a.75.75 0 0 1-1.06 0L7.28 11.03A.75.75 0 0 1 7.8 9.75Z" fill="#A3A9B6" />
                    </svg>
                </div>

                {dropdownOpen && (
                    <div className="min-w-[200px] px-6 py-4 bg-[#252C38] rounded-lg flex flex-col gap-4 absolute bottom-[-200px] right-[8px] transition-all">
                        <Link to="/dashboard/settings/profile" className="text-[#F4F7FF] hover:underline">
                            {t("profile")}
                        </Link>
                        <Link to="/dashboard/settings/attendance" className="text-[#F4F7FF] hover:underline">
                            {t("Master Settings")}
                        </Link>
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-[#F4F7FF] text-sm">{t("language")}</label>
                            <div
                                className="bg-[#1f2937] text-white px-2 py-1 rounded cursor-pointer flex justify-between items-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLangDropdownOpen(!langDropdownOpen);
                                }}
                            >
                                {language === "en" ? "English" : "Malay"}
                                <span>▼</span>
                            </div>
                            {langDropdownOpen && (
                                <ul className="absolute top-full left-0 bg-[#1f2937] mt-1 rounded shadow-lg w-full">
                                    <li
                                        onClick={() => handleLanguageChange("en")}
                                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                                    >
                                        English
                                    </li>
                                    <li
                                        onClick={() => handleLanguageChange("ms")}
                                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                                    >
                                        Malay
                                    </li>
                                </ul>
                            )}
                        </div>

                        <p onClick={handleLogout} className="text-[#F4F7FF] hover:underline cursor-pointer">
                            {t("logout")}
                        </p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;

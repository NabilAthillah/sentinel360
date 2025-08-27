import "flag-icons/css/flag-icons.min.css";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../types/user";
import Loader from "./Loader";
import { AlignLeft } from "lucide-react";

const HeaderLayout = ({
    openSidebar,
    handleLogout,
    title,
    user
}: {
    openSidebar: any;
    handleLogout: any;
    title: string;
    user: User | null;
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [language, setLanguage] = useState<"en" | "ms">("en");
    const { t, i18n } = useTranslation();
    const rootRef = useRef<HTMLDivElement>(null);
    const firstItemRef = useRef<HTMLAnchorElement>(null);
    const langButtonRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    const handleLanguageChange = (lang: "en" | "ms") => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        setLangDropdownOpen(false);
        i18n.changeLanguage(lang);
    };

    const menuVariants: Variants = {
        hidden: { opacity: 0, y: -6, scale: 0.98 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.16, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            y: -6,
            scale: 0.98,
            transition: { duration: 0.12, ease: "easeIn" },
        },
    };

    const listVariants: Variants = {
        hidden: { opacity: 0, y: -6 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.14, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            y: -6,
            transition: { duration: 0.1, ease: "easeIn" },
        },
    };

    const baseURL = new URL(process.env.REACT_APP_API_URL || "http://localhost:8000/");
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");

    const langToFlag = (lng: "en" | "ms") => (lng === "ms" ? "my" : "sg");

    return (
        <nav className="w-full bg-transparent p-6 flex items-center justify-between z-40 relative sm:gap-4">
          

            <button onClick={(e) => { navigate(-1) }} className="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer h-fit">
                    <path d="M27.333 14.0003C27.333 6.64033 21.3597 0.666992 13.9997 0.666992C6.63968 0.666991 0.666343 6.64032 0.666343 14.0003C0.666343 21.3603 6.63967 27.3337 13.9997 27.3337C21.3597 27.3337 27.333 21.3603 27.333 14.0003ZM11.333 14.0003L16.6663 8.66699L16.6663 19.3337L11.333 14.0003Z" fill="#98A1B3" />
                </svg>
                <h2 className="font-caladea text-[32px] text-[#F9F9F9] w-full">{title}</h2>
            </button>

            {user ? (
                <div
                    ref={rootRef}
                    className="flex items-center justify-end gap-2 relative sm:gap-4"
                >
                    <div className="relative">
                        <button
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={langDropdownOpen}
                            onClick={(e) => {
                                e.stopPropagation();
                                setLangDropdownOpen((v) => !v);
                                setDropdownOpen(false);
                            }}
                            className="h-8 w-8 rounded-full flex items-center justify-center ring-1 ring-white/10 hover:ring-white/20 bg-[#252C38]/80 backdrop-blur-sm"
                            title="Change language"
                        >
                            <span
                                className={`fi fis fi-${langToFlag(language)}`}
                                aria-hidden="true"
                            />
                            <span className="sr-only">Change language</span>
                        </button>

                        <AnimatePresence>
                            {langDropdownOpen && (
                                <motion.ul
                                    role="listbox"
                                    aria-label="Select language"
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="absolute left-0 mt-2 min-w-[44px] bg-[#252C38]/95 rounded-md shadow-lg overflow-hidden z-50 p-1 ring-1 ring-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <li
                                        role="option"
                                        aria-selected={language === "en"}
                                        className="p-1 rounded hover:bg-white/10 cursor-pointer flex items-center justify-center"
                                        onClick={() => handleLanguageChange("en")}
                                        title="English"
                                    >
                                        <span className="fi fis fi-sg" />
                                    </li>
                                    <li
                                        role="option"
                                        aria-selected={language === "ms"}
                                        className="p-1 rounded hover:bg-white/10 cursor-pointer flex items-center justify-center"
                                        onClick={() => handleLanguageChange("ms")}
                                        title="Malay"
                                    >
                                        <span className="fi fis fi-my" />
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile & dropdown */}
                    <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={dropdownOpen}
                        onClick={() => {
                            setDropdownOpen((v) => !v);
                            setLangDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer outline-none rounded-md px-1"
                    >
                        <div className="relative flex w-fit">
                            <span className="w-[14px] h-[14px] bg-[#22CAAD] border-2 border-[#07080B] rounded-full absolute bottom-[-2px] right-[-2px]" />
                            {user?.profile_image ? (
                                <img
                                    src={`${baseURL.toString()}storage/${user.profile_image}`}
                                    alt="profile"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <img
                                    src="/images/profile.png"
                                    alt="default profile"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            )}
                        </div>
                        <div className="hidden sm:flex flex-col gap-[2px] text-left :">
                            <p className="text-sm text-white">{user.name}</p>
                            <p className="text-xs leading-[21px] text-[#A3A9B6]">
                                {user.role.name}
                            </p>
                        </div>

                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            initial={false}
                            animate={{ rotate: dropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <path
                                d="M7.8 7.25h8.38a.75.75 0 0 1 .49 1.28l-4.19 4.19a.75.75 0 0 1-1.06 0L7.28 8.53A.75.75 0 0 1 7.8 7.25Z"
                                fill="#A3A9B6"
                            />
                        </motion.svg>
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                role="menu"
                                aria-label="User Menu"
                                variants={menuVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className="min-w-[240px] px-4 py-3 bg-[#252C38]/95 backdrop-blur-sm rounded-xl flex flex-col gap-3 absolute right-0 top-[calc(100%+10px)] z-50 shadow-xl ring-1 ring-white/10"
                            >
                                <Link
                                    ref={firstItemRef}
                                    to="/dashboard/settings/profile"
                                    role="menuitem"
                                    className="text-[#F4F7FF] rounded-md px-2 py-2 hover:bg-white/5 transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/dashboard/settings/attendance"
                                    role="menuitem"
                                    className="text-[#F4F7FF] rounded-md px-2 py-2 hover:bg-white/5 transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    {t("Master Settings")}
                                </Link>
                                <button
                                    role="menuitem"
                                    onClick={handleLogout}
                                    className="text-[#F4F7FF] rounded-md px-2 py-2 hover:bg-white/5 transition-colors text-left"
                                >
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <Loader primary />
            )}
        </nav>
    );
};

export default HeaderLayout;

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SecondLayout from "../../../layouts/SecondLayout";
import SidebarLayout from "../../../components/SidebarLayout";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Loader from "../../../components/Loader";
import PhoneInput from "react-phone-input-2";
import { AnimatePresence, motion } from "framer-motion";

function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        if (locked) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = prev || '';
        return () => {
            document.body.style.overflow = prev || '';
        };
    }, [locked]);
}
function SlideOver({
    isOpen,
    onClose,
    children,
    width = 568,
    ariaTitle,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
    ariaTitle?: string;
}) {
    const [open, setOpen] = useState(isOpen);
    useEffect(() => setOpen(isOpen), [isOpen]);
    useBodyScrollLock(open);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <AnimatePresence onExitComplete={onClose}>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    aria-hidden
                >
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaTitle}
                        className="absolute right-0 top-0 h-full w-full bg-[#252C38] shadow-xl overflow-auto"
                        style={{ maxWidth: width }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
const GuardTour = () => {
    const { pathname } = useLocation();
    const { t } = useTranslation();
    const [sidebar, setSidebar] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const chartInputRef = useRef<HTMLInputElement>(null);
    const [addData, setAddData] = useState(false);
    const [imageName, setImageName] = useState<string | null>(null);
    const [chartName, setChartName] = useState<string | null>(null);
    const [editData, setEditData] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted (static). Data belum terhubung DB 🚀");
        setAddData(false);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted (static). Data belum terhubung DB 🚀");
        setEditData(false);
    };
    const goToNextPage = () => {
        if (currentPage < 1) setCurrentPage((p) => p + 1);
    };
    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };
    return (
        <SecondLayout>
            <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />

            <div className="flex flex-col gap-6 px-[156px] pb-20 w-full h-full flex-1">
                <div className="flex flex-col gap-6 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="w-full md:w-[400px] flex items-center bg-[#222834] border-b border-[#98A1B3] rounded-t-md">
                            <input
                                type="text"
                                className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-t-md text-[#F4F7FF] placeholder:text-[#98A1B3] text-base focus:outline-none"
                                placeholder={t("Search")}
                            />
                            <button type="button" className="p-2" tabIndex={-1}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-full relative flex flex-1 pb-10">
                        <div className="w-full h-fit overflow-auto pb-5">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("S.no")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("Route name")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("Officer")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("Star Time")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("End Time")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t("Status")}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t("Actions")}</th>
                                    </tr>
                                </thead>
                                <tbody >
                                    <tr>
                                        <td className="text-[#F4F7FF] pt-6 pb-3">1</td>
                                        <td className="text-[#EFBF04] py-3">Route Name</td>
                                        <td className="text-[#F4F7FF] pt-6 pb-3">Michael</td>
                                        <td className="text-[#F4F7FF] pt-6 pb-3">1.21431245</td>
                                        <td className="text-[#F4F7FF] pt-6 pb-3">1.29976245</td>
                                        <td className="py-3">
                                            <span className="px-3 py-1 rounded-lg bg-[#FF7C6A1A] text-[#FF7C6A] text-sm font-medium">
                                                Incomplete
                                            </span>
                                        </td>
                                        <td className="pt-6 pb-3">
                                            <div className="flex gap-6 items-center justify-center">
                                                <svg
                                                    className="cursor-pointer" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H18C19.1 20 20 19.1 20 18V2C20 0.9 19.1 0 18 0ZM18 18H2V2H18V18ZM16 4H11C9.9 4 9 4.9 9 6V8.28C8.4 8.63 8 9.26 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 9.26 11.6 8.62 11 8.28V6H14V14H6V6H8V4H4V16H16V4Z" fill="#F9F9F9" />
                                                </svg>
                                                <svg onClick={() => {
                                                    setEditData(true);
                                                }} className="cursor-pointer" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0 18V13.75L13.2 0.575C13.4 0.391667 13.6208 0.25 13.8625 0.15C14.1042 0.05 14.3583 0 14.625 0C14.8917 0 15.15 0.05 15.4 0.15C15.65 0.25 15.8667 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15 18 3.4C18 3.66667 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L4.25 18H0ZM14.6 4.8L16 3.4L14.6 2L13.2 3.4L14.6 4.8Z" fill="#F9F9F9" />
                                                </svg>
                                                <svg className="cursor-pointer" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" fill="#F9F9F9" />
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-3 absolute bottom-0 right-0">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                <ArrowLeft size={14} />
                                {t('Previous')}
                            </button>
                            <button
                                disabled
                                className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B] rounded-md"
                            >
                                {currentPage}
                            </button>
                            <button
                                onClick={goToNextPage}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                {t('Next')}
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <SlideOver isOpen={editData} onClose={() => { setEditData(false); }} ariaTitle="Edit Guard" width={568}>
                {editData && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-h-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl leading-[36px] text-white font-noto">{t('Edit Guard')}</h2>
                            <button
                                type="button"
                                onClick={() => setEditData(false)}
                                className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">{t('Guard Name')}</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                                placeholder="Site Name"
                            />
                        </div>

                        <div className="flex gap-4 bottom flex-wrap pt-12">
                            <button
                                type="submit"
                                className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                            >
                                {t('Confirm')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditData(false)}
                                className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </SlideOver>


        </SecondLayout >
    );
};

export default GuardTour;

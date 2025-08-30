import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import { SwitchCustomStyleToggleable } from "../../../components/SwitchCustomStyleToggleable";
import SecondLayout from "../../../layouts/SecondLayout";
import SidebarLayout from "../../../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
const IncidentTypePage = () => {
    const [view, setView] = useState(false);
    const [edit, setEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [sidebar, setSidebar] = useState(true);
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    // const token = localStorage.getItem("tokens");

    const hasPermission = (permissionName: string) =>
        user?.role?.permissions?.some((p) => p.name === permissionName);

    const data = [
        'Reported to management?',
        'Reported to Police/SCDF?',
        'Any damanges to property?',
        'Any pictures?',
        'CCTV footage?',
    ]

    useEffect(() => {
        if (!hasPermission("list_incidents")) {
            navigate("/dashboard");
            return;
        }
    }, []);

    return (
        <SecondLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
                <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="w-full flex flex-col gap-4 flex-wrap">
                        <div className="flex items-end gap-4 w-fit flex-wrap md:flex-nowrap">
                            <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                <input
                                    type={"text"}
                                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="Search"
                                />
                                <button
                                    type="button"
                                    className="p-2 rounded-[4px_4px_0px_0px]"
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clipPath="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fillOpacity="1" /></g></g></svg>
                                </button>
                            </div>
                            <button className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all">{t('Download Report')}</button>
                        </div>
                        <div className="flex items-end gap-4 w-full flex-wrap">
                            <input
                                type={"text"}
                                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder="All sites"
                            />
                            <input
                                type={"text"}
                                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder="All employees"
                            />
                            <input
                                type={"text"}
                                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder="Date range"
                            />
                        </div>
                    </div>
                    <div className="w-full h-full relative flex flex-1 pb-10">
                        <div className="w-full h-fit overflow-x-auto pb-5">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('S/NO')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Date')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Time')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Site Name')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('What Happened')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Reported By')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Action')}</th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={4} className="py-10">
                                                <div className="w-full flex justify-center">
                                                    <Loader primary />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">1</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">24/5/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">02:34PM</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">The Rainforest</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Alarm activation</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Anson</td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_353_12259"><rect x="28" y="28" width="28" height="28" rx="0"/></clipPath></defs><g transform="matrix(-1,-5.2146120310681e-8,5.2146120310681e-8,-1,55.99999853990863,56.00000146009137)"><g clipPath="url(#master_svg0_353_12259)"><g><path d="M39.46283298828125,47.6719859375L44.766412988281246,47.6719859375C45.49571298828125,47.6719859375,46.09231298828125,47.0752859375,46.09231298828125,46.3460859375L46.09231298828125,39.7165359375L48.20051298828125,39.7165359375C49.38061298828125,39.7165359375,49.97721298828125,38.2845659375,49.14191298828125,37.4492459375L43.05601298828125,31.3633379375C42.54009298828125,30.8463349375,41.70246298828125,30.8463349375,41.18651298828125,31.3633379375L35.10061298828125,37.4492459375C34.26529298828125,38.2845659375,34.84869298828125,39.7165359375,36.02874298828125,39.7165359375L38.13693298828125,39.7165359375L38.13693298828125,46.3460859375C38.13693298828125,47.0752859375,38.73359298828125,47.6719859375,39.46283298828125,47.6719859375ZM34.15921298828125,50.3237859375L50.07011298828125,50.3237859375C50.79931298828125,50.3237859375,51.39601298828125,50.9203859375,51.39601298828125,51.649685937499996C51.39601298828125,52.3788859375,50.79931298828125,52.9755859375,50.07011298828125,52.9755859375L34.15921298828125,52.9755859375C33.42996998828125,52.9755859375,32.83331298828125,52.3788859375,32.83331298828125,51.649685937499996C32.83331298828125,50.9203859375,33.42996998828125,50.3237859375,34.15921298828125,50.3237859375Z" fill="#F4F7FF" fillOpacity="1"/></g></g></g></svg> */}
                                                    <svg onClick={() => setView(true)} className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_323_12972"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_323_12972)"><g><path d="M25,18.4L25,5.2C25,3.99,24.01,3,22.8,3L9.6,3C8.39,3,7.4,3.99,7.4,5.2L7.4,18.4C7.4,19.61,8.39,20.6,9.6,20.6L22.8,20.6C24.01,20.6,25,19.61,25,18.4ZM13.34,14.583L15.133,16.981L17.971,13.439C18.191200000000002,13.1646,18.608800000000002,13.1646,18.829,13.439L22.085,17.509C22.371,17.872,22.118,18.4,21.656,18.4L10.7,18.4C10.491679999999999,18.4,10.30123,18.2823,10.20806,18.096C10.114899999999999,17.909599999999998,10.135010000000001,17.686700000000002,10.26,17.52L12.46,14.583C12.68,14.297,13.12,14.297,13.34,14.583ZM3,8.5L3,22.8C3,24.01,3.99,25,5.2,25L19.5,25C20.105,25,20.6,24.505,20.6,23.9C20.6,23.295,20.105,22.8,19.5,22.8L6.3,22.8C5.695,22.8,5.2,22.305,5.2,21.7L5.2,8.5C5.2,7.895,4.705,7.4,4.1,7.4C3.495,7.4,3,7.895,3,8.5Z" fill="#F4F7FF" fillOpacity="1" /></g></g></g></svg>
                                                    {/* {hasPermission("edit_incident") && ( */}
                                                        <svg onClick={() => setEdit(true)} className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fillOpacity="1" /></g></g></g></svg>
                                                    {/* )} */}
                                                    <svg className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_342_15821"><rect x="28" y="28" width="28" height="28" rx="0" /></clipPath></defs><g transform="matrix(-1,-5.2146120310681e-8,5.2146120310681e-8,-1,55.99999853990863,56.00000146009137)"><g clipPath="url(#master_svg0_342_15821)"><g><path d="M39.46283298828125,47.6719859375L44.766412988281246,47.6719859375C45.49571298828125,47.6719859375,46.09231298828125,47.0752859375,46.09231298828125,46.3460859375L46.09231298828125,39.7165359375L48.20051298828125,39.7165359375C49.38061298828125,39.7165359375,49.97721298828125,38.2845659375,49.14191298828125,37.4492459375L43.05601298828125,31.3633379375C42.54009298828125,30.8463349375,41.70246298828125,30.8463349375,41.18651298828125,31.3633379375L35.10061298828125,37.4492459375C34.26529298828125,38.2845659375,34.84869298828125,39.7165359375,36.02874298828125,39.7165359375L38.13693298828125,39.7165359375L38.13693298828125,46.3460859375C38.13693298828125,47.0752859375,38.73359298828125,47.6719859375,39.46283298828125,47.6719859375ZM34.15921298828125,50.3237859375L50.07011298828125,50.3237859375C50.79931298828125,50.3237859375,51.39601298828125,50.9203859375,51.39601298828125,51.649685937499996C51.39601298828125,52.3788859375,50.79931298828125,52.9755859375,50.07011298828125,52.9755859375L34.15921298828125,52.9755859375C33.42996998828125,52.9755859375,32.83331298828125,52.3788859375,32.83331298828125,51.649685937499996C32.83331298828125,50.9203859375,33.42996998828125,50.3237859375,34.15921298828125,50.3237859375Z" fill="#F4F7FF" fillOpacity="1" /></g></g></g></svg>
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fillOpacity="1" /></g></g></g></svg> */}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* (
                                        <tr>
                                            <td colSpan={8} className="text-center text-[#F4F7FF] py-6">
                                                {t("No records found")}
                                            </td>
                                        </tr>
                                        ) */}
                                    </tbody>
                                )}
                            </table>

                        </div>
                        <div className="flex items-center justify-center gap-3 absolute bottom-0 right-3">
                            <button
                                // onClick={goToPrevPage}
                                // disabled={currentPage === 1}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                <ArrowLeft />
                                {t('Prev')}
                            </button>
                            <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B] rounded-md">
                                {/* {currentPage} */}1
                            </button>
                            <button
                                // onClick={goToNextPage}
                                // disabled={currentPage === totalPages}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                {t('Next')}
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {
                    edit && (
                        <motion.div
                            key="add-employee-overlay"
                            className="fixed inset-0 z-50 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        // onClick={() => setAddEmployee(false)}
                        >
                            <motion.aside
                                role="dialog"
                                aria-modal="true"
                                className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col gap-6 p-6">
                                    <h2 className='text-2xl leading-[36px] text-white font-noto'>{t('Edit Incident Details')}</h2>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Site Name')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Site name'
                                            value='Michael Yeow'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('What happened')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='What happened'
                                            value='Basement'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Why it happened')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Why it happened'
                                            value='Unknown'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('How it happened')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='How it happened'
                                            value='Power trip'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('When it happened')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='When it happened'
                                            value='19/08/2024 23:09:24'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Details of incident')}t</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Details of incident'
                                            value='24/05/2025'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Person injuried')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Person injuried'
                                            value='None'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Person involved')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Person involved'
                                            value='None'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Ops executive in-charge')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Ops executive in-charge'
                                            value='None'
                                        />
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#D65656]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#D65656]">{t('Report by')}y</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#D65656] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Report by'
                                            value=' '
                                        />
                                    </div>
                                    <div className="pt-3 flex flex-col gap-6">
                                        {data.map((item) => (
                                            <div className="flex items-center justify-between">
                                                <p className="leading-[21px] text-[#F4F7FF]">{item}</p>
                                                <SwitchCustomStyleToggleable />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                        <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">{t('Remarks')}</label>
                                        <input
                                            type={"text"}
                                            className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                            placeholder='Remarks'
                                            value='Uploaded to the system'
                                        />
                                    </div>
                                    <div className="flex gap-4 flex-wrap">
                                        <button onClick={() => { setEdit(false); toast.success('Employee edited successfully') }} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                        <button onClick={() => setEdit(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">{t('Cancel')}</button>
                                    </div>
                                </div>

                            </motion.aside>
                        </motion.div>
                    )
                }
            </AnimatePresence>
            {
                view && (
                    <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-6 pr-[150px] pl-6 py-6 bg-[#252C38]">
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>{t('View Image')}</h2>
                            <div className="w-[394px] h-[289px] rounded-lg bg-[#868686]"></div>
                            <button className="w-fit font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]" onClick={() => setView(false)}>{t('Vlose')}</button>
                        </div>
                    </div>
                )
            }
        </SecondLayout >
    )
}

export default IncidentTypePage
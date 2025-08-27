import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SecondLayout from '../../../layouts/SecondLayout';
import SidebarLayout from '../../../components/SidebarLayout';
import { useState } from 'react';

const ReportPage = () => {
    const { t } = useTranslation();
    const [sidebar, setSidebar] = useState(true);
    const reports = [
        { title: t('Employees') },
        { title: t('e-Occurrence') },
        { title: t('Incident') },
        { title: t('Site') },
        { title: t('Sop Document') },
        { title: t('Attendance') },
    ]

    return (
        <SecondLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
                <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
                <div className="flex flex-col pr-12 gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1 relative">

                    {/* <div className="flex items-end gap-4 w-fit flex-wrap md:flex-nowrap">
                        <div className="w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
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
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reports.map((report, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center gap-4 bg-[#2E3544] px-4 py-5 rounded-2xl"
                            >
                                <h3 className="text-lg font-semibold text-[#98A1B3] text-left self-start">{report.title}</h3>
                                <div className="flex gap-4 items-center flex-wrap 2xl:flex-nowrap">
                                    <button className="border border-[#EFBF04] text-[#181D26] bg-[#EFBF04] px-6 py-2 rounded-full hover:bg-[#EFBF04]/90 transition min-w-[125px] w-full">
                                        {t('Export Pdf')}
                                    </button>
                                    <button className="border border-[#EFBF04] text-[#EFBF04] px-6 py-2 rounded-full hover:bg-gray-700 transition min-w-[140px] w-full">
                                        {t('Export Excel')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* <div className="flex items-center justify-center gap-3 absolute bottom-0 right-3">
                        <button
                            className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                        >
                            <ArrowLeft size={14} />
                            {t('Previous')}
                        </button>

                        <button
                            disabled
                            className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B] rounded-md"
                        >
                            1
                        </button>

                        <button
                            className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                        >
                            {t('Next')}
                            <ArrowRight size={14} />
                        </button>
                    </div> */}
                </div>

            </div>
        </SecondLayout>
    )
}

export default ReportPage

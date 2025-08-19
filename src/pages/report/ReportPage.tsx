import React from 'react'
import MainLayout from '../../layouts/MainLayout'
import { use } from 'i18next'
import { useTranslation } from 'react-i18next'

const ReportPage = () => {
    const { t } = useTranslation();
    const reports = [
        { title: t('Employees') },
        { title: t('e-Occurrence') },
        { title: t('Incident') },
        { title: t('Site') },
        { title: t('Sop Document') },
        { title: t('Attendance') },
    ]

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full">
                <h2 className="text-2xl leading-9 text-white font-noto">{t('Report')}</h2>

                <div className="bg-[#252C38] rounded-lg shadow p-6">
                    <div className="flex justify-between flex-wrap gap-6">
                        {reports.map((report, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-center gap-4 w-full md:w-1/3"
                            >
                                <h3 className="text-lg font-semibold text-[#98A1B3]">{report.title}</h3>
                                <div className="flex gap-4">
                                    <button className="border border-[#EFBF04] text-[#EFBF04]  px-6 py-2 rounded hover:bg-gray-700 transition">
                                        {t('Export Pdf ')}
                                    </button>
                                    <button className="border border-[#EFBF04] text-[#EFBF04]  px-6 py-2 rounded hover:bg-gray-700 transition">
                                        {t('Export Excel')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default ReportPage

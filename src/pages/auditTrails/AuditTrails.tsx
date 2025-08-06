import React, { useState, useEffect } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { AuditTrail } from '../../types/auditTrials';
import { toast } from 'react-toastify';
import auditTrialsService from '../../services/auditTrailsService';

const AuditTrails = () => {
    const [logs, setLogs] = useState<AuditTrail[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditTrail | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const [showModal, setShowModal] = useState(false);
    const fetchAuditTrails = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await auditTrialsService.getAuditTrails(token);

            if (response.success) {
                setLogs(response.data);
                const filtered = response.data.filter((emp: AuditTrail) => emp.user.id !== currentUser.id);
                // setReportingEmployees(filtered);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const openModal = (log: AuditTrail) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedLog(null);
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    useEffect(() => {
        fetchAuditTrails();
    }, []);

    return (
        <MainLayout>
            <div className='flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Audit Trails</h2>
                <div className="flex flex-col flex-1 gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full">
                    <div className="w-full flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex items-end gap-4 w-fit flex-wrap md:flex-nowrap">
                            <button
                                className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                Download Report
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-full relative pb-10 flex flex-1">
                        <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">S/NO</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Name</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Email</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Activity</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Timestamp</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-white text-center py-6">No audit logs found</td>
                                        </tr>
                                    ) : (
                                        paginatedLogs.map((log, index) => (
                                            <tr key={log.id} className="border-b-[1px] border-b-[#98A1B3]">
                                                <td className="text-[#F4F7FF] py-3">{index + 1}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.name || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.email || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.title}</td>
                                                <td className="text-[#F4F7FF] py-3 text-center">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-[#EFBF04] text-[#252C38]">
                                                        {log.status || 'info'}
                                                    </span>
                                                </td>
                                                <td className="text-[#F4F7FF] py-3">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td>
                                                    <svg
                                                        onClick={() => openModal(log)}
                                                        className="w-6 h-6 text-white ml-3 cursor-pointer hover:text-blue-400 transition"
                                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                        width="24" height="24" fill="none" viewBox="0 0 24 24"
                                                    >
                                                        <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                                                        <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {showModal && selectedLog && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-[#1A1D23] text-white p-6 rounded-lg w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold">Audit Log Description</h2>
                                                <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                                            </div>
                                            <pre className="whitespace-pre-wrap text-sm text-[#F4F7FF]">{selectedLog.description}</pre>
                                        </div>
                                    </div>
                                )}

                            </table>
                        </div>
                        <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]"
                            >
                                {currentPage}
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AuditTrails
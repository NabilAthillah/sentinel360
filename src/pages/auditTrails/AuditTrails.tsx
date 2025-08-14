import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../../layouts/MainLayout';
import auditTrialsService from '../../services/auditTrailsService';
import { RootState } from '../../store';
import { AuditTrail } from '../../types/auditTrials';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AuditTrails = () => {
    const [logs, setLogs] = useState<AuditTrail[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditTrail | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const user = useSelector((state: RootState) => state.user.user);

    const fetchAuditTrails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await auditTrialsService.getAuditTrails(token);
            if (response.success) setLogs(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (log: AuditTrail) => { setSelectedLog(log); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setSelectedLog(null); };

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access audit trails page`;
            const description = `User ${user?.email} access audit trails page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access audit trails');
        } catch (error) { console.error(error); }
    };

    useEffect(() => { audit(); fetchAuditTrails(); }, []);

    const categories = Array.from(new Set(logs.map(l => l.category).filter(Boolean)));
    const usersMap = new Map<string, string>();
    logs.forEach(l => {
        const id = l.user?.id;
        const email = l.user?.email;
        if (id && email) usersMap.set(String(id), email);
    });
    const users = Array.from(usersMap, ([id, email]) => ({ id, email }));

    const inDateRange = (createdAt: string | Date) => {
        const t = new Date(createdAt).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        return t >= start && t <= end;
    };

    const dateFiltered = logs.filter(l => inDateRange(l.created_at));
    const categoryFiltered = selectedCategory
        ? dateFiltered.filter(l => l.category === selectedCategory)
        : dateFiltered;
    const userFiltered = selectedUserId
        ? categoryFiltered.filter(l => String(l.user?.id) === selectedUserId)
        : categoryFiltered;

    const filteredLogs = userFiltered;

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDateTime = (v: string | Date) => new Date(v).toLocaleString();

    const buildExportRows = () => {
        return filteredLogs.map((log, idx) => ({
            No: idx + 1,
            Name: log.user?.name ?? '-',
            Email: log.user?.email ?? '-',
            Activity: log.title ?? '',
            Status: log.status ?? 'info',
            Category: log.category ?? '-',
            Description: log.description ?? '',
            Timestamp: formatDateTime(log.created_at),
        }));
    };

    const sanitize = (s: string) => s.replace(/[:T]/g, '-').replace(/[^\w.\-@]/g, '_');
    const selectedUserEmail = selectedUserId ? (users.find(u => u.id === selectedUserId)?.email || selectedUserId) : '';

    const getFilename = (ext: 'xlsx' | 'pdf') => {
        const now = sanitize(new Date().toISOString().slice(0, 19));
        const scopeCat = selectedCategory ? `category-${sanitize(selectedCategory)}` : 'all-categories';
        const scopeUser = selectedUserId ? `user-${sanitize(selectedUserEmail)}` : 'all-users';
        const range =
            (startDate ? `from-${sanitize(startDate)}` : 'from-any') +
            '_' +
            (endDate ? `to-${sanitize(endDate)}` : 'to-any');
        return `audit-trails_${scopeCat}_${scopeUser}_${range}-${now}.${ext}`;
    };

    const handleDownloadExcel = () => {
        const rows = buildExportRows();
        if (!rows.length) return alert('Tidak ada data untuk diexport.');

        const headers = [
            'No', 'Name', 'Email', 'Activity', 'Status', 'Category', 'Description', 'Timestamp',
        ];
        const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

        const colWidths = headers.map((key) => {
            if (key === 'Description') return { wch: 40 };
            const maxLen = Math.max(key.length, ...rows.map(r => String((r as any)[key] ?? '').length));
            return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
        });
        (ws['!cols'] as any) = colWidths;

        const descColIdx = headers.indexOf('Description');
        const descColLetter = XLSX.utils.encode_col(descColIdx);
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        for (let R = range.s.r; R <= range.e.r; ++R) {
            const addr = `${descColLetter}${R + 1}`;
            const cell = (ws as any)[addr];
            if (!cell) continue;
            cell.s = cell.s || {};
            cell.s.alignment = { wrapText: true, vertical: 'top' };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Audit Trails');
        XLSX.writeFile(wb, getFilename('xlsx'));
    };

    const handleDownloadPDF = () => {
        const rows = buildExportRows();
        if (!rows.length) return alert('Tidak ada data untuk diexport.');

        const doc = new jsPDF({ orientation: 'landscape' });
        const head = [['S/NO', 'Name', 'Email', 'Activity', 'Status', 'Category', 'Description', 'Timestamp']];
        const body = rows.map(r => [r.No, r.Name, r.Email, r.Activity, r.Status, r.Category, r.Description, r.Timestamp]);

        autoTable(doc, {
            head,
            body,
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { halign: 'left' },
            bodyStyles: { halign: 'left', valign: 'top' },
            columnStyles: {
                6: { cellWidth: 60 },
            },
            margin: { top: 16, right: 10, left: 10 },
            didDrawPage: () => {
                doc.setFontSize(12);
                const titleParts = [
                    'Audit Trails',
                    selectedCategory ? `Category: ${selectedCategory}` : 'All Categories',
                    selectedUserId ? `User: ${selectedUserEmail}` : 'All Users',
                    startDate || endDate ? `Range: ${startDate || 'any'} → ${endDate || 'any'}` : '',
                ].filter(Boolean);
                doc.text(titleParts.join(' — '), 10, 12);
            },
        });

        doc.save(getFilename('pdf'));
    };
    

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full">
                <h2 className="text-2xl leading-9 text-white font-noto">Audit Trails</h2>

                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="flex justify-start relative">
                        <div className="relative flex gap-6">

                            <select
                                className="max-w-[250px] w-full h-[44px] px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowDropdown(prev => !prev)}
                                className="font-medium text-sm min-w-[160px] text-[#EFBF04] px-4 py-[9.5px] border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                Download Report
                            </button>
                            {showDropdown && (
                                <div className="absolute mt-2 w-full bg-[#222834] border border-[#EFBF04] rounded-lg shadow-lg overflow-hidden z-50">
                                    <button
                                        onClick={() => {
                                            handleDownloadExcel();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[#F4F7FF] hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDownloadPDF();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[#F4F7FF] hover:bg-[#EFBF04] hover:text-[#252C38]"
                                    >
                                        PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex justify-between items-center gap-4 flex-wrap lg:flex-nowrap">
                        <div className="flex flex-wrap md:flex-nowrap items-end gap-4 w-full">


                            <select
                                className="max-w-[250px] w-full h-[44px] px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Users</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.email}</option>
                                ))}
                            </select>

                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-[44px] px-3 bg-[#222834] text-[#F4F7FF] border-b border-b-[#98A1B3] rounded-[4px_4px_0_0] active:outline-none focus-visible:outline-none"
                            />
                            <span className="text-[#98A1B3]">to</span>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-[44px] px-3 bg-[#222834] text-[#F4F7FF] border-b border-b-[#98A1B3] rounded-[4px_4px_0_0] active:outline-none focus-visible:outline-none"
                            />

                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setCurrentPage(1);
                                }}
                                className="text-sm text-[#EFBF04] px-3 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                Clear Dates
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
                                    {loading ? (
                                        <tr><td colSpan={7} className="text-white text-center py-6">Loading...</td></tr>
                                    ) : paginatedLogs.length === 0 ? (
                                        <tr><td colSpan={7} className="text-white text-center py-6">No audit logs found</td></tr>
                                    ) : (
                                        paginatedLogs.map((log, index) => (
                                            <tr key={log.id} className="border-b border-b-[#98A1B3]">
                                                <td className="text-[#F4F7FF] py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.name || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.email || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.title}</td>
                                                <td className="text-[#F4F7FF] py-3 text-center">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-[#EFBF04] text-[#252C38]">
                                                        {log.status || 'info'}
                                                    </span>
                                                </td>
                                                <td className="text-[#F4F7FF] py-3">{formatDateTime(log.created_at)}</td>
                                                <td>
                                                    <svg
                                                        onClick={() => openModal(log)}
                                                        className="w-6 h-6 text-white ml-3 cursor-pointer hover:text-blue-400 transition"
                                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                                                        <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="font-medium text-xs text-[#B3BACA] py-1 px-[14px] rounded-l-lg bg-[#575F6F] disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button className="font-medium text-xs text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                                {currentPage}
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages}
                                className="font-medium text-xs text-[#B3BACA] py-1 px-[14px] rounded-r-lg bg-[#575F6F] disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>

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
                </div>
            </div >
        </MainLayout >
    );
};

export default AuditTrails;

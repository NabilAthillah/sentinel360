import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { AuditTrail } from '../../../types/auditTrials';
import { RootState } from '../../../store';
import auditTrialsService from '../../../services/auditTrailsService';
import MainLayout from '../../../layouts/MainLayout';
import Loader from '../../../components/Loader';
import SecondLayout from '../../../layouts/SecondLayout';
import SidebarLayout from '../../../components/SidebarLayout';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const AuditTrails = () => {
    const [logs, setLogs] = useState<AuditTrail[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState<null | 'excel' | 'pdf'>(null);
    const [selectedLog, setSelectedLog] = useState<AuditTrail | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const token = useSelector((state: RootState) => state.token.token);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: RootState) => state.user.user);

    const fetchAuditTrails = async () => {
        if (!token) return;
        setLoading(true);
        try {
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



    const categories = Array.from(new Set(logs.map(l => l.category).filter(Boolean)));

    const usersMap = new Map<string, string>();
    logs.forEach(l => {
        const id = l.user?.id;
        const email = l.user?.email;
        if (id && email) usersMap.set(String(id), email);
    });
    const users = Array.from(usersMap, ([id, email]) => ({ id, email }));

    const statusOrder = new Map([['success', 0], ['warning', 1], ['error', 2], ['info', 3]]);
    const statuses = Array.from(new Set(logs.map(l => (l.status || 'info').toLowerCase())))
        .sort((a, b) => (statusOrder.get(a) ?? 999) - (statusOrder.get(b) ?? 999) || a.localeCompare(b));

    const inDateRange = (createdAt: string | Date) => {
        const t = new Date(createdAt).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        return t >= start && t <= end;
    };

    const inTimeRange = (createdAt: string | Date) => {
        if (!startTime && !endTime) return true;
        const d = new Date(createdAt);
        const minutes = d.getHours() * 60 + d.getMinutes();

        const parseHM = (hm: string, fallback: number) => {
            if (!hm) return fallback;
            const [h, m] = hm.split(':').map(Number);
            return (h * 60) + (m || 0);
        };

        const startM = parseHM(startTime, 0);
        const endM = parseHM(endTime, 23 * 60 + 59);

        if (startM <= endM) return minutes >= startM && minutes <= endM;
        return minutes >= startM || minutes <= endM;
    };

    const dateFiltered = logs.filter(l => inDateRange(l.created_at));
    const userFiltered = selectedUserId
        ? dateFiltered.filter(l => String(l.user?.id) === selectedUserId)
        : dateFiltered;
    const categoryFiltered = selectedCategory
        ? userFiltered.filter(l => l.category === selectedCategory)
        : userFiltered;
    const statusFiltered = selectedStatus
        ? categoryFiltered.filter(l => (l.status || 'info').toLowerCase() === selectedStatus)
        : categoryFiltered;
    const timeFiltered = statusFiltered.filter(l => inTimeRange(l.created_at));

    const filteredLogs = timeFiltered;

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
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
        const scopeStatus = selectedStatus ? `status-${sanitize(selectedStatus)}` : 'all-statuses';
        const dateRange =
            (startDate ? `from-${sanitize(startDate)}` : 'from-any') +
            '_' +
            (endDate ? `to-${sanitize(endDate)}` : 'to-any');
        const timeRange =
            (startTime ? `time-${sanitize(startTime)}` : 'time-any') +
            (endTime ? `_to-${sanitize(endTime)}` : `_to-any`);
        return `audit-trails_${scopeCat}_${scopeUser}_${scopeStatus}_${dateRange}_${timeRange}-${now}.${ext}`;
    };

    const handleDownloadExcel = () => {
        const rows = buildExportRows();
        if (!rows.length) { alert('Tidak ada data untuk diexport.'); return; }
        try {
            setExporting('excel');
            const headers = ['No', 'Name', 'Email', 'Activity', 'Status', 'Category', 'Description', 'Timestamp'];
            const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

            const colWidths = headers.map((key) => {
                if (key === 'Description') return { wch: 40 };
                const maxLen = Math.max(key.length, ...rows.map(r => String((r as any)[key] ?? '').length));
                return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
            });
            (ws['!cols'] as any) = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Audit Trails');
            XLSX.writeFile(wb, getFilename('xlsx'));
        } finally {
            setExporting(null);
        }
    };

    const handleDownloadPDF = () => {
        const rows = buildExportRows();
        if (!rows.length) { alert('Tidak ada data untuk diexport.'); return; }
        try {
            setExporting('pdf');
            const doc = new jsPDF({ orientation: 'landscape' });
            const head = [['S/NO', 'Name', 'Email', 'Activity', 'Status', 'Category', 'Description', 'Timestamp']];
            const body = rows.map(r => [r.No, r.Name, r.Email, r.Activity, r.Status, r.Category, r.Description, r.Timestamp]);

            autoTable(doc, {
                head,
                body,
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { halign: 'left' },
                bodyStyles: { halign: 'left', valign: 'top' },
                columnStyles: { 6: { cellWidth: 60 } },
                margin: { top: 16, right: 10, left: 10 },
                didDrawPage: () => {
                    doc.setFontSize(12);
                    const titleParts = [
                        'Audit Trails',
                        selectedCategory ? `Category: ${selectedCategory}` : 'All Categories',
                        selectedUserId ? `User: ${selectedUserEmail}` : 'All Users',
                        selectedStatus ? `Status: ${selectedStatus}` : 'All Statuses',
                        (startDate || endDate) ? `Date: ${startDate || 'any'} → ${endDate || 'any'}` : '',
                        (startTime || endTime) ? `Time: ${startTime || 'any'} → ${endTime || 'any'}` : '',
                    ].filter(Boolean);
                    doc.text(titleParts.join(' — '), 10, 12);
                },
            });

            doc.save(getFilename('pdf'));
        } finally {
            setExporting(null);
        }
    };


    const getStatusClasses = (status?: string) => {
        const s = (status || 'info').toLowerCase();
        if (s === 'success') return 'bg-[rgba(25,206,116,0.16)] text-[#19CE74] border border-[#19CE74]';
        if (s === 'error' || s === 'failed' || s === 'fail') return 'bg-[rgba(255,126,106,0.16)] text-[#FF7E6A] border border-[#FF7E6A]';
        if (s === 'warning' || s === 'warn') return 'bg-[rgba(239,191,4,0.16)] text-[#EFBF04] border border-[#EFBF04]';
        return 'bg-sky-400/15 text-sky-300 border border-sky-400/30';
    };


    useEffect(() => { audit(); fetchAuditTrails(); }, []);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    return (
        <SecondLayout>
            <SidebarLayout isOpen={true} closeSidebar={undefined} />
            <div className="flex flex-col gap-6 pr-[156px] pb-20 w-full min-h-[calc(100vh-91px)] h-full">

                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1 relative">
                    <div className="w-full flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex flex-wrap items-end gap-4 w-full">
                            <select
                                className="max-w-[250px] w-full h-[44px] px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base border-b border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                                value={selectedCategory}
                                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">{t("All Categories")}</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>

                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => { setStartTime(e.target.value); setCurrentPage(1); }}
                                className="h-[44px] px-3 bg-[#222834] text-[#F4F7FF] border-b border-b-[#98A1B3] rounded-[4px_4px_0_0] active:outline-none focus-visible:outline-none"
                            />
                            <span className="text-[#98A1B3]">{t('to')}</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => { setEndTime(e.target.value); setCurrentPage(1); }}
                                className="h-[44px] px-3 bg-[#222834] text-[#F4F7FF] border-b border-b-[#98A1B3] rounded-[4px_4px_0_0] active:outline-none focus-visible:outline-none"
                            />

                            <button
                                onClick={() => { setStartTime(''); setEndTime(''); setCurrentPage(1); }}
                                className="text-sm text-[#EFBF04] px-3 py-2 border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                            >
                                {t(' Clear Time')}
                            </button>
                        </div>
                    </div>

                    <div className="w-full flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex flex-wrap items-end gap-4 w-full">
                            <select
                                className="max-w-[180px] w-full h-[44px] px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base border-b border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                                value={selectedStatus}
                                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">{t("All Statuses")}</option>
                                {statuses.map((s) => (
                                    <option key={s} value={s} className="capitalize">{s}</option>
                                ))}
                            </select>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(prev => !prev)}
                                    disabled={exporting !== null}
                                    aria-expanded={showDropdown}
                                    aria-haspopup="menu"
                                    className={`font-medium text-sm min-w-[160px] px-4 py-[9.5px] rounded-full border transition
      ${exporting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#EFBF04] hover:text-[#252C38]'}
      ${showDropdown ? 'bg-[#EFBF04] text-[#252C38] border-[#EFBF04]' : 'text-[#EFBF04] border-[#EFBF04]'}
    `}
                                >
                                    {exporting ? 'Generating…' : t('Download Report')}
                                </button>

                                <div
                                    role="menu"
                                    aria-hidden={!showDropdown}
                                    className={`absolute right-0 mt-2 min-w-[180px] bg-[#222834] border border-[#EFBF04] rounded-lg shadow-lg overflow-hidden z-50
      origin-top-right transform motion-safe:transition motion-safe:duration-200 motion-safe:ease-out [will-change:transform,opacity]
      ${showDropdown
                                            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                                            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}
    `}
                                >
                                    <button
                                        role="menuitem"
                                        disabled={exporting === 'excel'}
                                        onClick={() => { setShowDropdown(false); handleDownloadExcel(); }}
                                        className="w-full text-left px-4 py-2 text-[#F4F7FF] hover:bg-[#EFBF04] hover:text-[#252C38] disabled:opacity-60 transition-colors"
                                    >
                                        Excel
                                    </button>
                                    <button
                                        role="menuitem"
                                        disabled={exporting === 'pdf'}
                                        onClick={() => { setShowDropdown(false); handleDownloadPDF(); }}
                                        className="w-full text-left px-4 py-2 text-[#F4F7FF] hover:bg-[#EFBF04] hover:text-[#252C38] disabled:opacity-60 transition-colors"
                                    >
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full relative pb-10 flex flex-1">
                        <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('S/NO')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Name')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Email')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Activity')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Status')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Timestamp')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Action')}</th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={7} className="py-10">
                                                <div className="w-full flex justify-center">
                                                    <Loader primary />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {(paginatedLogs.length === 0) && (
                                            <tr><td colSpan={7} className="text-white text-center py-6">{t('No audit logs found')}</td></tr>
                                        )}
                                        {paginatedLogs.map((log, index) => (
                                            <tr key={log.id} className="border-b border-b-[#98A1B3]">
                                                <td className="text-[#F4F7FF] py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.name || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.user?.email || '-'}</td>
                                                <td className="text-[#F4F7FF] py-3">{log.title}</td>
                                                <td className="text-[#F4F7FF] py-3 text-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(log.status)}`}>
                                                        {(log.status || 'info').toLowerCase()}
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
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>

                        <div className="absolute bottom-0 right-0 flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                <ArrowLeft size={14} />
                                {t('Previous')}
                            </button>
                            <button className="font-medium text-xs text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                                {currentPage}
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                            >
                                {t('Next')}
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {showModal && selectedLog && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-[#1A1D23] text-white p-6 rounded-lg w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">{t('Audit Log Description')}</h2>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                                </div>
                                <pre className="whitespace-pre-wrap text-sm text-[#F4F7FF]">{selectedLog.description}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </SecondLayout >
    );
};

export default AuditTrails;

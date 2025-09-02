import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SecondLayout from '../../../layouts/SecondLayout';
import SidebarLayout from '../../../components/SidebarLayout';
import { useEffect, useState } from 'react';
import { Site } from '../../../types/site';
import { User } from '../../../types/user';
import { OccurrenceCategory } from '../../../types/occurrenceCategory';
import { Occurrence } from '../../../types/occurrence';
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import employeeService from '../../../services/employeeService';
import siteService from '../../../services/siteService';
import occurrenceCatgService from '../../../services/occurrenceCatgService';
import occurrenceService from '../../../services/occurrenceService';
import { SopDocument } from '../../../types/sopDocument';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import sopDocumentService from '../../../services/sopDocumentService';
import { toast } from 'react-toastify';
import Loader from '../../../components/Loader';
import { useNavigate } from 'react-router-dom';

const reportHeaders: Record<string, { header: string; dataKey: string }[]> = {
    Employees: [
        { header: "ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Language", dataKey: "language" },
        { header: "NRIC/FIN No", dataKey: "nric_fin_no" },
        { header: "Mobile", dataKey: "mobile" },
        { header: "Address", dataKey: "address" },
        { header: "Briefing Date", dataKey: "briefing_date" },
        { header: "Date Joined", dataKey: "date_joined" },
        { header: "Briefing Conducted", dataKey: "briefing_conducted" },
        { header: "Q1", dataKey: "q1" },
        { header: "A1", dataKey: "a1" },
        { header: "Q2", dataKey: "q2" },
        { header: "A2", dataKey: "a2" },
        { header: "Q3", dataKey: "q3" },
        { header: "A3", dataKey: "a3" },
        { header: "Q4", dataKey: "q4" },
        { header: "A4", dataKey: "a4" },
        { header: "Q5", dataKey: "q5" },
        { header: "A5", dataKey: "a5" },
        { header: "Q6", dataKey: "q6" },
        { header: "A6", dataKey: "a6" },
        { header: "Q7", dataKey: "q7" },
        { header: "A7", dataKey: "a7" },
        { header: "Q8", dataKey: "q8" },
        { header: "A8", dataKey: "a8" },
        { header: "Q9", dataKey: "q9" },
        { header: "A9", dataKey: "a9" },
        { header: "Email Verified At", dataKey: "email_verified_at" },
        { header: "Password", dataKey: "password" },
        { header: "Status", dataKey: "status" },
        { header: "Profile Image", dataKey: "profile_image" },
        { header: "First Login", dataKey: "first_login" },
        { header: "Last Login", dataKey: "last_login" },
    ],

    "Sop Document": [
        { header: "ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Document", dataKey: "document" },
        { header: "Created At", dataKey: "created_at" },
        { header: "Updated At", dataKey: "updated_at" },
    ],

    "e-Occurrence": [
        { header: "ID", dataKey: "id" },
        { header: "Date", dataKey: "date" },
        { header: "Time", dataKey: "time" },
        { header: "Detail", dataKey: "detail" },
        { header: "Site ID", dataKey: "site_id" },
        { header: "Category ID", dataKey: "category_id" },
        { header: "User ID", dataKey: "user_id" },
        { header: "Created At", dataKey: "created_at" },
        { header: "Updated At", dataKey: "updated_at" },
    ],

    Attendance: [
        { header: "ID", dataKey: "id" },
        { header: "Time In", dataKey: "time_in" },
        { header: "Time Out", dataKey: "time_out" },
        { header: "Reason", dataKey: "reason" },
        { header: "Created At", dataKey: "created_at" },
        { header: "Updated At", dataKey: "updated_at" },
        { header: "Check In Time", dataKey: "check_in_time" },
        { header: "Check Out Time", dataKey: "check_out_time" },
    ],

    Incident: [
        { header: "ID", dataKey: "id" },
        { header: "Person Involved", dataKey: "person_involved" },
        { header: "How It Happened", dataKey: "how_it_happened" },
        { header: "Incident Date", dataKey: "incident_date" },
        { header: "Reported Date", dataKey: "reported_date" },
        { header: "Conclusion", dataKey: "conclusion" },
        { header: "Reported to Management", dataKey: "reported_to_management" },
        { header: "Reported to Police", dataKey: "reported_to_police" },
        { header: "Any Damages to Property", dataKey: "any_damages_to_property" },
        { header: "Any Pictures Attached", dataKey: "any_pictures_attached" },
        { header: "CCTV Footage", dataKey: "cctv_footage" },
        { header: "Picture Footage", dataKey: "picture_footage" },
        { header: "Incident Type ID", dataKey: "incident_type_id" },
        { header: "Site ID", dataKey: "site_id" },
        { header: "User ID", dataKey: "user_id" },
        { header: "Created At", dataKey: "created_at" },
        { header: "Updated At", dataKey: "updated_at" },
    ],

    Site: [
        { header: "ID", dataKey: "id" },
        { header: "Image", dataKey: "image" },
        { header: "Name", dataKey: "name" },
        { header: "Msct Number", dataKey: "msct_number" },
        { header: "Managing Agent", dataKey: "managing_agent" },
        { header: "Person In Charge", dataKey: "person_in_charge" },
        { header: "Mobile", dataKey: "mobile" },
        { header: "Pic", dataKey: "pic" },
        { header: "Address", dataKey: "address" },
        { header: "Postal Code", dataKey: "postal_code" },
        { header: "Latittude", dataKey: "lat" },
        { header: "Longittude", dataKey: "long" },
        { header: "Organisation Chart", dataKey: "organisation_chat" },
        { header: "NFC Tag", dataKey: "nfc_tag" },
        { header: "Created At", dataKey: "created_at" },
        { header: "Updated At", dataKey: "updated_at" },
    ]
};


const ReportPage = () => {
    const { t } = useTranslation();
    const [sidebar, setSidebar] = useState(true);
    const [sites, setSites] = useState<Site[]>([]);
    const [employee, setEmployee] = useState<User[]>([]);
    const [categories, setCategories] = useState<OccurrenceCategory[]>([]);
    const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
    const token = useSelector((state: RootState) => state.token.token);
    const [loadingList, setLoadingList] = useState(false);
    const [document, setDocument] = useState<SopDocument[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const user = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();


    const reports = [
        { title: t('Employees'), data: employee },
        { title: t('e-Occurrence'), data: occurrences },
        { title: t('Incident'), data: [] },
        { title: t('Site'), data: sites },
        { title: t('Sop Document'), data: document },
        { title: t('Attendance'), data: [] },
    ];
    const totalPages = Math.max(
        ...reports.map(r => Math.ceil(r.data.length / itemsPerPage))
    ) || 1;
    const handlePrev = () => {
        setCurrentPage(p => Math.max(1, p - 1));
    };

    const handleNext = () => {
        setCurrentPage(p => Math.min(totalPages, p + 1));
    };

    const fecthdocument = async () => {
        if (!token) return;
        const response = await sopDocumentService.getSop(token);
        if (response?.data) setDocument(response.data);
    }
    const fetchSites = async () => {
        if (!token) return;
        const response = await siteService.getAllSite(token);
        if (response?.data) setSites(response.data);
    };

    const fetchEmployees = async () => {
        if (!token) return;
        const response = await employeeService.getAllEmployee(token);
        if (response?.data) setEmployee(response.data);
    };

    const fetchCategories = async () => {
        if (!token) return;
        const response = await occurrenceCatgService.getCategories(token);
        if (response?.data) {
            const data = response.data.categories.filter(
                (c: OccurrenceCategory) => c.status === 'active'
            );
            setCategories(data);
        }
    };

    const fetchOccurrences = async () => {
        if (!token) return;
        const response = await occurrenceService.getAllOccurrence(token);
        if (response?.data) {
            const data = response.data.filter(
                (o: Occurrence) => o.category.status === 'active'
            );
            setOccurrences(data);
        }
    };

    const fetchAll = async () => {
        setLoadingList(true);
        try {
            await Promise.allSettled([
                fetchOccurrences(),
                fetchSites(),
                fetchCategories(),
                fetchEmployees(),
                fecthdocument(),
            ]);
        } finally {
            setLoadingList(false);
        }
    };

    const exportExcel = (title: string, data: any[], headers?: { header: string; dataKey: string }[]) => {
        if (!data || data.length === 0) {
            toast.warning(`No data available for ${title}!`);
            return;
        }

        try {
            const headerKeys = headers ? headers.map(h => h.dataKey) : Object.keys(data[0] || {});
            const headerTitles = headers ? headers.map(h => h.header) : headerKeys;

            const rows = data.map((row, i) => {
                const newRow: any = { No: i + 1 };
                headerKeys.forEach((key, idx) => {
                    newRow[headerTitles[idx]] = row[key] ?? "";
                });
                return newRow;
            });

            const ws = XLSX.utils.json_to_sheet(rows, { header: ["No", ...headerTitles] });

            const colWidths = ["No", ...headerTitles].map((key) => {
                if (key.toLowerCase().includes("description") || key.toLowerCase().includes("detail")) {
                    return { wch: 40 };
                }
                const maxLen = Math.max(
                    key.length,
                    ...rows.map(r => String(r[key] ?? "").length)
                );
                return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
            });
            (ws["!cols"] as any) = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, title);
            XLSX.writeFile(wb, `${title}.xlsx`);
        } catch (err) {
            toast.error(`Failed to export ${title}`);
            console.error(err);
        }
    };


    const exportPdf = (title: string, rows: any[], filters?: Record<string, string | undefined>) => {
        if (!rows.length) {
            toast.warning(`No data available for ${title}!`);
            return;
        }
        try {
            const doc = new jsPDF({ orientation: 'landscape' });

            const headers = reportHeaders[title];
            if (!headers) {
                alert(`Headers are not defined for ${title}`);
                return;
            }

            const head = [headers.map(h => h.header)];

            const body = rows.map((item, idx) =>
                headers.map(h => h.dataKey === "id" ? `${idx + 1}` : (item[h.dataKey] ?? ""))
            );

            autoTable(doc, {
                head,
                body,
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { halign: 'left', fillColor: [41, 128, 185], textColor: 255 },
                bodyStyles: { halign: 'left', valign: 'top' },
                margin: { top: 20, right: 10, left: 10 },
                didDrawPage: () => {
                    doc.setFontSize(12);
                    const titleParts = [
                        `${title} Report`,
                        filters?.category ? `Category: ${filters.category}` : '',
                        filters?.user ? `User: ${filters.user}` : '',
                        filters?.status ? `Status: ${filters.status}` : '',
                        filters?.date ? `Date: ${filters.date}` : '',
                        filters?.time ? `Time: ${filters.time}` : '',
                    ].filter(Boolean);
                    doc.text(titleParts.join(' — '), 10, 12);
                },
            });

            doc.save(`${title}.pdf`);
        } catch (err) {
            toast.error(`Failed to export ${title}`);
            console.error(err);
        }
    };


    const hasPermission = (permissionName: string) =>
        user?.role?.permissions?.some((p) => p.name === permissionName);

    useEffect(() => {
        if (!hasPermission('list_reports')) {
            navigate('/dashboard');
            return;
        }
        fetchAll();
    }, [token]);

    return (
        <SecondLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
                <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />

                <div className="flex flex-col pr-12 gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1 relative">
                    {loadingList ? (
                        <div className="flex w-full h-full justify-center items-center">
                            <Loader primary />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {reports.map((report, idx) => {

                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center gap-4 bg-[#2E3544] px-4 py-5 rounded-2xl"
                                    >
                                        <h3 className="text-lg font-semibold text-[#98A1B3] text-left self-start">
                                            {report.title}
                                        </h3>

                                        <div className="flex gap-4 items-center flex-wrap 2xl:flex-nowrap">
                                            <button
                                                onClick={() => exportPdf(report.title, report.data)}
                                                className="border border-[#EFBF04] text-[#181D26] bg-[#EFBF04] px-6 py-2 rounded-full hover:bg-[#EFBF04]/90 transition min-w-[125px] w-full"
                                            >
                                                {t('Export Pdf')}
                                            </button>
                                            <button
                                                onClick={() => exportExcel(report.title, report.data)}
                                                className="border border-[#EFBF04] text-[#EFBF04] px-6 py-2 rounded-full hover:bg-gray-700 transition min-w-[140px] w-full"
                                            >
                                                {t('Export Excel')}
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                            onClick={handlePrev}
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
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50"
                        >
                            {t('Next')}
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

            </div>
        </SecondLayout>
    );
};

export default ReportPage;

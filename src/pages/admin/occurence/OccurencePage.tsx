import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import { useTranslation } from "react-i18next";
import { RootState } from "../../../store";
import { Site } from "../../../types/site";
import { Employee } from "../../../types/employee";
import { OccurrenceCategory } from "../../../types/occurrenceCategory";
import { Occurrence } from "../../../types/occurrence";
import siteService from "../../../services/siteService";
import occurrenceCatgService from "../../../services/occurrenceCatgService";
import occurrenceService from "../../../services/occurrenceService";
import auditTrialsService from "../../../services/auditTrailsService";
import MainLayout from "../../../layouts/MainLayout";
import Loader from "../../../components/Loader";
interface OccurrenceInput {
  id_site: string;
  id_category: string;
  occurred_at: string;
  detail?: string;
}

/* ===== Helpers: Animated UI ===== */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (locked) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
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

  // esc close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          key="overlay"
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CenterModal({
  isOpen,
  onClose,
  children,
  ariaTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaTitle?: string;
}) {
  const [open, setOpen] = useState(isOpen);
  useEffect(() => setOpen(isOpen), [isOpen]);
  useBodyScrollLock(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          key="modal-overlay"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaTitle}
            className="w-[min(92vw,560px)] bg-[#252C38] rounded-2xl shadow-xl overflow-hidden"
            initial={{ y: 20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
/* ===== End Helpers ===== */

const OccurencePage = () => {
  const [sidebar] = useState(false); // (disimpan untuk kompatibilitas, belum dipakai)
  const [editData, setEditData] = useState(false);
  const [addData, setAddData] = useState(false);

  const [loadingAction, setLoadingAction] = useState(false); // submit add occurrence
  const [loadingList, setLoadingList] = useState(false); // fetch list/table

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const [sites, setSites] = useState<Site[]>([]);
  const [employee, setEmployee] = useState<Employee[]>([]); // (opsional: tidak digunakan fetch di sini)
  const [categories, setCategories] = useState<OccurrenceCategory[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t, i18n } = useTranslation();
  const [site, setSite] = useState("");
  const [category, setCategory] = useState("");

  const filteredItems = useMemo(() => {
    return occurrences.filter((occurrence) => {
      const matchSite = site ? occurrence.site.id === site : true;
      const matchCategory = category ? occurrence.category.id === category : true;
      const matchSearchTerm = searchTerm
        ? occurrence.site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occurrence.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occurrence.reported_by.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchSite && matchCategory && matchSearchTerm;
    });
  }, [occurrences, site, category, searchTerm]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const fetchSites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      navigate("/auth/login");
      return;
    }
    const response = await siteService.getAllSite(token);
    if (response?.data) setSites(response.data);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      navigate("/auth/login");
      return;
    }
    const response = await occurrenceCatgService.getCategories(token);
    if (response?.data) {
      const data = response.data.categories.filter((c: OccurrenceCategory) => c.status === "active");
      setCategories(data);
    }
  };

  const fetchOccurrences = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      navigate("/auth/login");
      return;
    }
    const response = await occurrenceService.getAllOccurrence(token);
    if (response?.data) {
      const data = response.data.filter((o: Occurrence) => o.category.status === "active");
      setOccurrences(data);
    }
  };

  const fetchAll = async () => {
    setLoadingList(true);
    try {
      await Promise.allSettled([fetchOccurrences(), fetchSites(), fetchCategories()]);
    } finally {
      setLoadingList(false);
    }
  };

  const [formData, setFormData] = useState<OccurrenceInput[]>([
    { id_site: "", id_category: "", occurred_at: "", detail: "" },
  ]);

  const handleChange = (index: number, field: keyof OccurrenceInput, value: string) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddRow = () => {
    setFormData((prev) => [...prev, { id_site: "", id_category: "", occurred_at: "", detail: "" }]);
  };

  const handleRemove = (index: number) => {
    setFormData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.clear();
        navigate("/auth/login");
        return;
      }
      const response = await occurrenceService.addOccurrence(token, formData);
      if (response.success) {
        toast.success("Occurrence created successfully");
        setFormData([{ id_site: "", id_category: "", occurred_at: "", detail: "" }]);
        await fetchAll();
        setAddData(false); // ditutup setelah list refresh; anim handled inside SlideOver
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSearch = () => {
    // tetap ada kalau kamu mau trigger manual; sekarang filter pakai useMemo
  };

  const audit = async () => {
    try {
      const token = localStorage.getItem("token");
      const title = `Access occurrence page`;
      const description = `User ${user?.email} access occurrence page`;
      const status = "success";
      await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, "access occurrences");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    audit();
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [site, category, searchTerm]);

  const handleDownload = () => {
    if (occurrences.length === 0) {
      toast.warning('No occurrence data to export.');
      return;
    }

    const headers = ['S/NO', 'Date', 'Time', 'Site Name', 'Category', 'Reported By'];

    const rows = occurrences.map((occ, index) => [
      index + 1,
      occ.date,
      occ.time,
      occ.site?.name || '',
      occ.category?.name || '',
      occ.reported_by?.name || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';') // pakai delimiter titik koma
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'occurrence_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <MainLayout>
      <div className='flex flex-col gap-6 px-6 pb-20 w-full h-full flex-1'>
        <h2 className='text-2xl leading-9 text-white font-noto'>{t('e-Occurrence')}</h2>
        <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center gap-4 flex-wrap lg:flex-nowrap">
              <div className="flex items-end gap-4 w-full flex-wrap md:flex-nowrap">
                <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                  <input
                    type="text"
                    className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                    placeholder="Search by employee"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <button
                    type="button"
                    className="p-2 rounded-[4px_4px_0px_0px]"
                    tabIndex={-1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                  </button>
                </div>
                <button onClick={handleDownload} className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all">{t('Download Report')}</button>
              </div>
              <div className="w-[210px]">
                <button onClick={() => setAddData(true)} className="font-medium text-base min-w-[210px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">{t('Add Occurence')}</button>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4 w-full xl:grid xl:grid-cols-4">
              {/* All Sites */}
              <select
                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                <option value="">{t('All sites')}</option>
                {sites.map((siteItem) => (
                  <option key={siteItem.id} value={siteItem.id}>
                    {siteItem.name}
                  </option>
                ))}
              </select>
              <select
                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <option value="">{t('All employees')}</option>
                {employee.map((occ) => (
                  <option key={occ.id} value={occ.user.name}>
                    {occ.user.name}
                  </option>
                ))}
              </select>
              <select
                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base border-b-[1px] border-b-[#98A1B3] active:outline-none focus-visible:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{t('All categories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type={"text"}
                className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                placeholder="Date range"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full h-full relative flex flex-1 pb-10">
            <div className="w-full h-fit overflow-auto pb-5">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr>
                    <th className="font-semibold text-[#98A1B3] text-start">S.NO</th>
                    <th className="font-semibold text-[#98A1B3] text-start">Date</th>
                    <th className="font-semibold text-[#98A1B3] text-start">Time</th>
                    <th className="font-semibold text-[#98A1B3] text-start">Site name</th>
                    <th className="font-semibold text-[#98A1B3] text-start">Category</th>
                    <th className="font-semibold text-[#98A1B3] text-start">Reported by</th>
                    <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                  </tr>
                </thead>
                {loadingList ? (
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
                    {currentItems.map((occurrence, index) => (
                      <tr key={`${occurrence.id}-${index}`}>
                        <td className="text-[#F4F7FF] pt-6 pb-3">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="text-[#F4F7FF] pt-6 pb-3 ">{occurrence.date}</td>
                        <td className="text-[#F4F7FF] pt-6 pb-3 ">{occurrence.time}</td>
                        <td className="text-[#F4F7FF] pt-6 pb-3 ">{occurrence.site.name}</td>
                        <td className="text-[#F4F7FF] pt-6 pb-3 ">{occurrence.category.name}</td>
                        <td className="text-[#F4F7FF] pt-6 pb-3 ">{occurrence.reported_by.name}</td>
                        <td className="pt-6 pb-3">
                          <div className="flex gap-6 items-center justify-center">
                            <svg
                              onClick={() => setEditData(true)}
                              className="cursor-pointer"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              width="28"
                              height="28"
                              viewBox="0 0 28 28"
                            >
                              <path
                                d="M3.5,20.1249V24.5H7.875L20.7783,11.5967L16.4033,7.2217L3.5,20.1249ZM24.1617,8.2133C24.6166,7.7593,24.6166,7.0223,24.1617,6.5683L21.4317,3.8383C20.9777,3.3834,20.2406,3.3834,19.7867,3.8383L17.6517,5.9733L22.0267,10.3483L24.1617,8.2133Z"
                                fill="#F4F7FF"
                              />
                            </svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-white py-6">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
              </table>
            </div>
            {/* Pagination */}
            <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
              <button
                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                {currentPage}
              </button>
              <button
                className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL (center) */}
      <CenterModal isOpen={editData} onClose={() => setEditData(false)} ariaTitle="Edit occurrence details">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl leading-[36px] text-white font-noto">Edit occurrence details</h2>
            <button
              type="button"
              onClick={() => setEditData(false)}
              className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {/* Contoh field statis (sesuaikan dengan datamu) */}
          <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
            <label className="text-xs text-[#98A1B3]">Site name</label>
            <input type="text" className="w-full bg-[#222834] text-[#F4F7FF] text-base" value="Michael Yeow" readOnly />
          </div>
          <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
            <label className="text-xs text-[#98A1B3]">Category</label>
            <input type="text" className="w-full bg-[#222834] text-[#F4F7FF] text-base" value="Accident" readOnly />
          </div>
          <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
            <label className="text-xs text-[#98A1B3]">Location</label>
            <input type="text" className="w-full bg-[#222834] text-[#F4F7FF] text-base" value="Basement" readOnly />
          </div>
          <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
            <label className="text-xs text-[#98A1B3]">When it happened</label>
            <input type="text" className="w-full bg-[#222834] text-[#F4F7FF] text-base" value="19/08/2024 23:09:24" readOnly />
          </div>
          <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
            <label className="text-xs text-[#98A1B3]">Report by</label>
            <input type="text" className="w-full bg-[#222834] text-[#F4F7FF] text-base" value="MSN" readOnly />
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                setEditData(false);
                toast.success("Attendance edited successfully");
              }}
              className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
            >
              Save
            </button>
            <button
              onClick={() => setEditData(false)}
              className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
            >
              Cancel
            </button>
          </div>
        </div>
      </CenterModal>

      {/* ADD SLIDE-OVER (kanan) */}
      <SlideOver isOpen={addData} onClose={() => setAddData(false)} ariaTitle="Add occurrence" width={568}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-h-full">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl leading-[36px] text-white font-noto">Add occurrence</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddRow}
                className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
              >
                Add another
              </button>
              <button
                type="button"
                onClick={() => setAddData(false)}
                className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {formData
            .map((_, index) => formData.length - 1 - index)
            .map((realIndex) => {
              const item = formData[realIndex];
              return (
                <div key={realIndex} className="flex flex-col gap-6">
                  {formData.length > 1 && realIndex !== formData.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(realIndex)}
                      className="text-sm text-red-400 hover:underline self-start"
                    >
                      Delete
                    </button>
                  )}

                  <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                    <label className="text-xs text-[#98A1B3]">Site Name</label>
                    <select
                      className="w-full bg-[#222834] text-[#F4F7FF] text-base outline-none"
                      onChange={(e) => handleChange(realIndex, "id_site", e.target.value)}
                      value={item.id_site}
                      required
                    >
                      <option value="">Select Site</option>
                      {sites?.length > 0 &&
                        sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                    <label className="text-xs text-[#98A1B3]">Category</label>
                    <select
                      className="w-full bg-[#222834] text-[#F4F7FF] text-base outline-none"
                      onChange={(e) => handleChange(realIndex, "id_category", e.target.value)}
                      value={item.id_category}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.length > 0 &&
                        categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                    <label className="text-xs text-[#98A1B3]">Occurrence at</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-[#222834] text-[#F4F7FF] text-base outline-none"
                      placeholder="Occurrence at"
                      onChange={(e) => handleChange(realIndex, "occurred_at", e.target.value)}
                      value={item.occurred_at}
                      required
                    />
                  </div>

                  <div className="flex flex-col w-full px-4 pt-2 py-2 bg-[#222834] border-b border-b-[#98A1B3]">
                    <label className="text-xs text-[#98A1B3]">Details of occurrence</label>
                    <textarea
                      className="w-full bg-[#222834] text-[#F4F7FF] text-base outline-none min-h-[96px]"
                      value={item.detail}
                      onChange={(e) => handleChange(realIndex, "detail", e.target.value)}
                      placeholder="(Optional) add more info…"
                    />
                  </div>
                </div>
              );
            })}

          <div className="flex gap-4 flex-wrap mt-2">
            <button
              type="submit"
              disabled={loadingAction}
              className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04] disabled:opacity-60"
            >
              {loadingAction ? <Loader primary /> : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setAddData(false)}
              className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>
    </MainLayout>
  );
};

export default OccurencePage;

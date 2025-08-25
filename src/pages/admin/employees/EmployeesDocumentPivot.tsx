import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { EmployeeDocument } from "../../../types/employeeDocument";
import employeeDocumentService from "../../../services/employeeDocumentService";
import employeeDocumentPivotService from "../../../services/employeDocumenPivot";
import Loader from "../../../components/Loader";

interface Props {
  employeeId: string;
  token: string;
  fetchEmployees?: () => void;
  user: {
    name?: string;
    email?: string;
    mobile?: string;
    profile_image?: string;
    employee?: {
      id?: string;
      nric_fin_no?: string;
    };
  };
  onClose: () => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const EmployeeDocumentPivot = ({ employeeId, token, fetchEmployees, user, onClose }: Props) => {
  const [open, setOpen] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<EmployeeDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { base64?: string; previewUrl: string }>>({});
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        if (!token) {
          localStorage.clear();
          navigate("/auth/login");
          return;
        }

        const docTypeResponse = await employeeDocumentService.getEmployeeDocuments(token);
        if (docTypeResponse.success) {
          const types = (docTypeResponse.data as EmployeeDocument[]).filter((t) => t.status === "active");
          setDocumentTypes(types);
        }

        const existingResponse = await employeeDocumentPivotService.getEmployeeDocument(token, employeeId);
        if (existingResponse.success) {
          const fileMap: Record<string, { previewUrl: string }> = {};
          existingResponse.data.forEach((doc: any) => {
            fileMap[doc.id_document] = { previewUrl: doc.url };
          });
          setUploadedFiles(fileMap);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch documents.");
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();

    return () => {
      Object.values(uploadedFiles).forEach((f) => {
        if (f?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [token, navigate, employeeId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      toast.warning("Maximum file size is 5MB!");
      event.target.value = "";
      return;
    }

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64 = await toBase64(file);
      const previewUrl = URL.createObjectURL(file);

      const prev = uploadedFiles[documentId]?.previewUrl;
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);

      setUploadedFiles((prevMap) => ({
        ...prevMap,
        [documentId]: { base64, previewUrl },
      }));
    } catch (error: any) {
      toast.error(error?.message || "Failed to read file.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [documentId, file] of Object.entries(uploadedFiles)) {
        if (!file.base64) continue;
        const response = await employeeDocumentPivotService.addEmployeeDocument(
          token,
          employeeId,
          documentId,
          file.base64
        );
        if (!response.success) {
          toast.error(`Failed to upload document ${documentId}`);
          setSaving(false);
          return;
        }
      }

      toast.success("Employee documents uploaded successfully");
      fetchEmployees?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload documents.");
    } finally {
      setSaving(false);
    }
  };

  const profileSrc = user?.profile_image ? `/storage/${user.profile_image}` : "/images/Avatar2.png";

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          key="docpivot-overlay"
          className="fixed inset-0 z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl leading-[36px] text-white font-noto">{t("Upload Employeee Details")}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[#98A1B3] hover:text-white text-xl leading-none px-2"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="relative flex gap-10 w-full">
                <img
                  src={profileSrc}
                  alt="profile"
                  className="w-[104px] h-[104px] object-cover rounded-full"
                />
                <div className="flex flex-col gap-4">
                  <p className="font-medium text-xl text-[#F4F7FF]">{user?.name || "-"}</p>
                  <div className="flex gap-16">
                    <div className="flex flex-col">
                      <p className="text-xs text-[#98A1B3]">NRIC/FIN</p>
                      <p className="text-[#F4F7FF]">{user?.employee?.nric_fin_no || "-"}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-[#98A1B3]">{t("Mobile")}</p>
                      <p className="text-[#F4F7FF]">{user?.mobile || "-"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-[#98A1B3]">{t("Email")}</p>
                    <p className="text-[#F4F7FF]">{user?.email || "-"}</p>
                  </div>
                </div>
              </div>

              {loadingDocs ? (
                <div className="w-full flex justify-center py-10">
                  <Loader primary />
                </div>
              ) : (
                <>
                  {documentTypes.map((doc) => (
                    <div key={doc.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <label htmlFor={`upload-${doc.id}`} className="text-xs text-[#98A1B3]">
                          {doc.name}
                        </label>
                        {uploadedFiles[doc.id]?.previewUrl && (
                          <a
                            href={uploadedFiles[doc.id].previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#EFBF04] underline hover:text-yellow-300"
                          >
                            {t("View")}
                          </a>
                        )}
                      </div>

                      <input
                        type="file"
                        id={`upload-${doc.id}`}
                        accept="application/pdf,image/*"
                        onChange={(e) => handleFileChange(e, doc.id)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`upload-${doc.id}`}
                        className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                      >
                        {t("Chosee File")}
                      </label>
                    </div>
                  ))}

                  <div className="flex gap-4 flex-wrap mt-4 justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]"
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04] disabled:opacity-60"
                    >
                      {saving ? <Loader primary /> : "Save"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeDocumentPivot;

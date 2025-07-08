import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import employeeDocumentPivotService from "../../services/employeDocumenPivot";
import employeeDocumentService from "../../services/employeeDocumentService";
import { EmployeeDocument } from "../../types/employeeDocument";

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

const EmployeeDocumentPivot = ({ employeeId, token, fetchEmployees, user, onClose }: Props) => {
  const [documentTypes, setDocumentTypes] = useState<EmployeeDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { base64?: string; previewUrl: string }>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!token) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const docTypeResponse = await employeeDocumentService.getEmployeeDocuments(token);
        if (docTypeResponse.success) {
          const types = docTypeResponse.data.filter((t: EmployeeDocument) => t.status === 'active');
          setDocumentTypes(types);
        }

        const existingResponse = await employeeDocumentPivotService.getEmployeeDocument(token, employeeId);
        if (existingResponse.success) {
          const fileMap: Record<string, { previewUrl: string }> = {};
          existingResponse.data.forEach((doc: any) => {
            fileMap[doc.id_document] = { previewUrl: doc.url }; // gunakan URL absolut dari backend
          });
          setUploadedFiles(fileMap);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch documents.");
      }
    };

    fetchDocuments();
  }, [token, navigate, employeeId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64 = await toBase64(file);
      const previewUrl = URL.createObjectURL(file); // hanya untuk preview lokal
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: { base64, previewUrl }
      }));
    } catch (error: any) {
      toast.error(error?.message || "Failed to read file.");
    }
  };

  const handleSave = async () => {
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
          return;
        }
      }

      toast.success("Employee documents uploaded successfully");
      fetchEmployees?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload documents.");
    }
  };

  return (
    <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
        <h2 className="text-2xl leading-[36px] text-white font-noto">Upload employee details</h2>

        {/* Header Profile */}
        <div className="relative flex gap-10 w-full">
          <img
            src={user?.profile_image ? `/storage/${user.profile_image}` : "/images/Avatar2.png"}
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
                <p className="text-xs text-[#98A1B3]">Mobile</p>
                <p className="text-[#F4F7FF]">{user?.mobile || "-"}</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-[#98A1B3]">Email</p>
              <p className="text-[#F4F7FF]">{user?.email || "-"}</p>
            </div>
          </div>
        </div>

        {/* Upload Dokumen */}
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
                  View
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
              Choose file
            </label>
          </div>
        ))}

        {/* Tombol Aksi */}
        <div className="flex gap-4 flex-wrap mt-4">
          <button
            onClick={handleSave}
            className="font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDocumentPivot;

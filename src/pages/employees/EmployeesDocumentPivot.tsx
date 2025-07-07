import { useEffect, useState } from "react";
import employeeDocumentPivotService from "../../services/employeDocumenPivot";
import employeeDocumentService from "../../services/employeeDocumentService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!token) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const response = await employeeDocumentService.getEmployeeDocuments(token);
        if (response.success) setDocumentTypes(response.data);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch document types.");
      }
    };

    fetchDocuments();
  }, [token, navigate]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
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
      const response = await employeeDocumentPivotService.addEmployeeDocument(
        token,
        employeeId,
        documentId,
        base64
      );

      if (response.success) {
        toast.success(response.message);
        fetchEmployees?.();
      } else {
        toast.error(response.message || "Upload failed.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload document.");
    }
  };

  return (
    <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
        <h2 className="text-2xl leading-[36px] text-white font-noto">Edit employee details</h2>

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
            <label htmlFor={`upload-${doc.id}`} className="text-xs text-[#98A1B3]">
              {doc.name}
            </label>
            <input
              type="file"
              id={`upload-${doc.id}`}
              accept="application/pdf,image/*"
              onChange={(e) => handleFileUpload(e, doc.id)}
              className="hidden"
            />
            <label
              htmlFor={`upload-${doc.id}`}
              className="font-medium text-sm text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
            >
              Upload file
            </label>
          </div>
        ))}

        {/* Tombol Aksi */}
        <div className="flex gap-4 flex-wrap mt-4">
          <button
            onClick={() => {
              onClose();
              toast.success("Employee document uploaded successfully");
            }}
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

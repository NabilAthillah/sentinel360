import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../components/Loader";
import occurrenceCatgService from "../../../services/occurrenceCatgService";
import occurrenceService from "../../../services/occurrenceService";
import siteService from "../../../services/siteService";

type OccurrenceInput = {
  id_site: string;
  id_category: string;
  occurred_at: string;
  detail?: string;
};

type Site = { id: string; name: string };
type OccurrenceCategory = { id: string; name: string; status?: string };

const ReportOccurance = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<OccurrenceCategory[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<OccurrenceInput[]>([
    { id_site: "", id_category: "", occurred_at: "", detail: "" },
  ]);

  const swalOpt = {
    background: "#1e1e1e",
    color: "#f4f4f4",
    confirmButtonColor: "#EFBF04",
    customClass: { popup: "swal2-dark-popup" },
  } as const;

  const tokenGuard = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      Swal.fire({
        icon: "error",
        title: "Session expired",
        text: "Please login to continue.",
        ...swalOpt,
      }).then(() => navigate("/auth/login"));
      return null;
    }
    return token;
  };

  const fetchSites = async () => {
    const token = tokenGuard();
    if (!token) return;
    const res = await siteService.getAllSite(token);
    if (res?.data) setSites(res.data);
  };

  const fetchCategories = async () => {
    const token = tokenGuard();
    if (!token) return;
    const res = await occurrenceCatgService.getCategories(token);
    if (res?.data) {
      const active = (res.data.categories || []).filter((c: OccurrenceCategory) => c.status === "active");
      setCategories(active);
    }
  };

  const fetchAll = async () => {
    setLoadingLists(true);
    try {
      await Promise.allSettled([fetchSites(), fetchCategories()]);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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

  const handleRemoveRow = (index: number) => {
    setFormData((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    for (let i = 0; i < formData.length; i++) {
      const row = formData[i];
      if (!row.id_site || !row.id_category || !row.occurred_at) {
        Swal.fire({
          icon: "error",
          title: "Validation error",
          text: `Row #${i + 1}: Site, Category, and Date/Time are required.`,
          ...swalOpt,
        });
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = tokenGuard();
      if (!token) return;
      const res = await occurrenceService.addOccurrence(token, formData);
      if (res?.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Occurrence report saved.",
          ...swalOpt,
        });
        navigate("/user/e-occurence")
        setFormData([{ id_site: "", id_category: "", occurred_at: "", detail: "" }]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res?.message || "Failed to save",
          ...swalOpt,
        });
      }
    } catch (e: any) {
      if (e?.response?.status === 422 && e.response.data?.errors) {
        const errs = e.response.data.errors as Record<string, string[]>;
        const firstMsg = Object.values(errs)[0]?.[0] || "Validation failed";
        Swal.fire({
          icon: "error",
          title: "Validation error",
          text: firstMsg,
          ...swalOpt,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: e?.response?.data?.message || "Failed to save",
          ...swalOpt,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] px-6 flex flex-col gap-6 justify-between pt-20">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
          <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Report</h1>
        </div>

        <div className="flex flex-col gap-6 mt-2">
          {formData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4 bg-[#1f2430] p-4 rounded-xl">
              {formData.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="self-start text-sm text-red-400 hover:underline"
                >
                  Delete row
                </button>
              )}

              <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
                <label className="text-xs text-[#98A1B3]">Site</label>
                <select
                  className="bg-[#222630] text-[#F4F7FF] outline-none"
                  value={item.id_site}
                  onChange={(e) => handleChange(idx, "id_site", e.target.value)}
                  disabled={loadingLists}
                  required
                >
                  <option value="">Select Site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
                <label className="text-xs text-[#98A1B3]">Category</label>
                <select
                  className="bg-[#222630] text-[#F4F7FF] outline-none"
                  value={item.id_category}
                  onChange={(e) => handleChange(idx, "id_category", e.target.value)}
                  disabled={loadingLists}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
                <label className="text-xs text-[#98A1B3]">Date & Time</label>
                <input
                  type="datetime-local"
                  className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none"
                  value={item.occurred_at}
                  onChange={(e) => handleChange(idx, "occurred_at", e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
                <label className="text-xs text-[#98A1B3]">Occurrence Detail (optional)</label>
                <textarea
                  className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none min-h-[96px]"
                  value={item.detail}
                  onChange={(e) => handleChange(idx, "detail", e.target.value)}
                  placeholder="(Optional) add more info…"
                />
              </div>
            </div>
          ))}

          <div>
            <button
              type="button"
              onClick={handleAddRow}
              className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
            >
              Add another
            </button>
          </div>
        </div>
      </div>

      <div className="pb-9">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="w-full py-3 bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center disabled:opacity-60"
        >
          {saving ? <Loader primary /> : "Save Report"}
        </button>
      </div>
    </div>
  );
};

export default ReportOccurance;

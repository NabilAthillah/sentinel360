import { ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import occurrenceCatgService from "../../../services/occurrenceCatgService";
import occurrenceService from "../../../services/occurrenceService";
import siteService from "../../../services/siteService";
import Loader from "../../../components/Loader";

type OccurrenceInput = {
  id_site: string;
  id_category: string;
  occurred_at: string;
  detail?: string;
};

type Site = { id: string; name: string };
type OccurrenceCategory = { id: string; name: string; status?: string };

const EditOccurance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<OccurrenceCategory[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<OccurrenceInput>({
    id_site: "",
    id_category: "",
    occurred_at: "",
    detail: "",
  });

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
      const active = (res.data.categories || []).filter(
        (c: OccurrenceCategory) => c.status === "active"
      );
      setCategories(active);
    }
  };

  const fetchOccurrenceDetail = async () => {
    if (!id) return;
    const token = tokenGuard();
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await occurrenceService.getAllOccurrence(token);
      if (res) {
        const occ = res.data.find((o: any) => o.id === id);
        if (occ) {
          setFormData({
            id_site: occ.site?.id || "",
            id_category: occ.category?.id || "",
            occurred_at: occ.occurred_at || "",
            detail: occ.detail || "",
          });
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch occurrence detail.",
        ...swalOpt,
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchCategories();
    fetchOccurrenceDetail();
  }, [id]);

  const handleChange = (field: keyof OccurrenceInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = async () => {
    const token = tokenGuard();
    if (!token || !id) return;

    // pastikan occurred_at ada detiknya
    let occurredAt = formData.occurred_at;
    if (occurredAt && occurredAt.length === 16) {
      // kalau masih "YYYY-MM-DDTHH:MM" tambahin ":00"
      occurredAt = occurredAt + ":00";
    }

    const payload = {
      ...formData,
      occurred_at: occurredAt,
    };

    setSaving(true);
    try {
      await occurrenceService.updateOccurrence(token, id, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Occurrence updated successfully",
        ...swalOpt,
      }).then(() => navigate("/user/e-occurence"));
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update occurrence",
        ...swalOpt,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <Loader primary />;

  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-6 justify-between">
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-3 pt-8">
          <ChevronLeft
            size={20}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl font-normal text-[#F4F7FF]">Edit Report</h1>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
            <label className="text-xs text-[#98A1B3]">Site</label>
            <select
              className="bg-[#222630] text-[#F4F7FF] outline-none"
              value={formData.id_site}
              onChange={(e) => handleChange("id_site", e.target.value)}
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
              value={formData.id_category}
              onChange={(e) => handleChange("id_category", e.target.value)}
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
              value={formData.occurred_at}
              onChange={(e) => handleChange("occurred_at", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 border-b rounded-md">
            <label className="text-xs text-[#98A1B3]">
              Occurrence Detail (optional)
            </label>
            <textarea
              className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none min-h-[96px]"
              value={formData.detail}
              onChange={(e) => handleChange("detail", e.target.value)}
              placeholder="(Optional) add more info…"
            />
          </div>
        </div>
      </div>

      <div className="pb-9 flex flex-row justify-between gap-12">
        <Link
          to="/user/e-occurence/history"
          className="gap-3 w-full py-3 border border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center"
        >
          <p>Cancel</p>
        </Link>
        <button
          onClick={handleEdit}
          disabled={saving}
          className="gap-3 w-full py-3 bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditOccurance;

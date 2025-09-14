// src/pages/incident/Report.tsx
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import IncidentService from "../../../services/incidentService";
import IncidentTypesService from "../../../services/incidentTypeService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

type Yn = "Yes" | "No";
type YnEmpty = "" | Yn;

type IncidentType = {
  id: string;
  name: string;
  // add other fields if needed (e.g., is_active)
};

/** Text / Textarea field - forwards the native event to parent */
type FieldOnChange =
  | React.ChangeEventHandler<HTMLInputElement>
  | React.ChangeEventHandler<HTMLTextAreaElement>;

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  textarea = false,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: FieldOnChange;
  textarea?: boolean;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 rounded-md">
    {textarea ? (
      <textarea
        placeholder={placeholder || label}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
        className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none min-h-[96px]"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder || label}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none"
      />
    )}
  </div>
);

/** Radio group - forwards the native event to parent */
const RadioGroup = ({
  label,
  value,
  onChange,
  name,
}: {
  label: string;
  value: YnEmpty;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
}) => {
  const groupName =
    name ||
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">{label}</p>
      <div className="flex gap-6">
        {(["Yes", "No"] as const).map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${value === option ? "border-[#EFBF04]" : "border-[#F4F7FF]"
                }`}
            >
              {value === option && (
                <span className="w-2 h-2 rounded-full bg-[#EFBF04]" />
              )}
            </span>
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={value === option}
              onChange={onChange}
              className="hidden"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const Report = () => {
  const navigate = useNavigate();

  // incident types (from DB)
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentTypeId, setIncidentTypeId] = useState<string>("");
  const user = useSelector((state: RootState) => state.user.user);
  // text inputs (no defaults)
  const [occurredAt, setOccurredAt] = useState(""); // YYYY-MM-DD
  const [locationText, setLocationText] = useState("");
  const [whyHappened, setWhyHappened] = useState("");
  const [howHappened, setHowHappened] = useState("");
  const [personInvolved, setPersonInvolved] = useState("");
  const [personInjured, setPersonInjured] = useState("");
  const [remarks, setRemarks] = useState("");
  const [detail, setDetail] = useState("");
  const [acknowledgedBy, setAcknowledgedBy] = useState("");
  const { idSite } = useParams<{ idSite: string }>();
  // radios (no defaults)
  const [managementReport, setManagementReport] = useState<YnEmpty>("");
  const [policeReport, setPoliceReport] = useState<YnEmpty>("");
  const [damageProperty, setDamageProperty] = useState<YnEmpty>("");
  const [pictureAttached, setPictureAttached] = useState<YnEmpty>("");
  const [cctvFootage, setCctvFootage] = useState<YnEmpty>("");

  // files
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await IncidentTypesService.getIncidentTypes();
        if (res.success) {
          setIncidentTypes(res?.data ?? []);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Failed to load incident types",
          text: err?.message || "Please try again later.",
          background: "#1e1e1e",
          color: "#fff",
        });
      }
    })();
  }, []);



  const ynTo01 = (v: Yn) => (v === "Yes" ? "1" : "0");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    console.log({
      incidentTypeId,
      occurredAt,
      locationText,
    });
    try {
      if (!incidentTypeId || !occurredAt || !locationText) {
        Swal.fire({
          icon: "warning",
          title: "Please complete the form",
          text: "At minimum, choose What Happened (type), and fill Date and Location.",
          background: "#1e1e1e",
          color: "#fff",
        });
        return;
      }

      const radios: [string, YnEmpty][] = [
        ["Incident reported to management", managementReport],
        ["Incident reported to Police/ SCDF", policeReport],
        ["Any damage to the property", damageProperty],
        ["Any picture attached", pictureAttached],
        ["Any CCTV footage", cctvFootage],
      ];
      const unselected = radios.find(([, v]) => v === "");
      if (unselected) {
        Swal.fire({
          icon: "warning",
          title: "Missing selection",
          text: `Please choose an option for "${unselected[0]}".`,
          background: "#1e1e1e",
          color: "#fff",
        });
        return;
      }

      const fd = new FormData();
      fd.append("incident_type_id", incidentTypeId);
      fd.append("occurred_at", occurredAt);
      fd.append("location", locationText);
      fd.append("why_happened", whyHappened);
      fd.append("how_happened", howHappened);
      fd.append("person_involved", personInvolved);
      fd.append("person_injured", personInjured);
      fd.append("remarks", remarks);
      fd.append("detail", detail);
      fd.append("acknowledged_by", acknowledgedBy);
      fd.append("management_report", ynTo01(managementReport as Yn));
      fd.append("police_report", ynTo01(policeReport as Yn));
      fd.append("damage_property", ynTo01(damageProperty as Yn));
      fd.append("picture_attached", ynTo01(pictureAttached as Yn));
      fd.append("cctv_footage", ynTo01(cctvFootage as Yn));
      fd.append("id_site", idSite || "");
      fd.append("id_user", user?.id || "");
      images.forEach((file) => fd.append("images[]", file));

      const res = await IncidentService.addIncident(fd);

      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Incident report has been saved.",
          background: "#1e1e1e",
          color: "#fff",
        });
        navigate("/user/incident/history");
      } else {
        throw new Error(res?.message || "Failed to save incident");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Oops! Something went wrong",
        background: "#1e1e1e",
        color: "#fff",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-6 pt-20">
      <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
        <ChevronLeft
          size={20}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl font-normal">Report</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* What Happened (select) */}
        <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 rounded-md">
          <select
            value={incidentTypeId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setIncidentTypeId(e.target.value)
            }
            className="bg-[#222630] text-[#F4F7FF] outline-none"
          >
            <option value="" disabled>
              What Happened?
            </option>
            {incidentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Date"
          type="date"
          value={occurredAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOccurredAt(e.target.value)
          }
        />
        <FormField
          label="Location"
          value={locationText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLocationText(e.target.value)
          }
        />
        <FormField
          label="Why it happened"
          value={whyHappened}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setWhyHappened(e.target.value)
          }
          textarea
        />
        <FormField
          label="How it happened"
          value={howHappened}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setHowHappened(e.target.value)
          }
          textarea
        />
        <FormField
          label="Person involved"
          value={personInvolved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPersonInvolved(e.target.value)
          }
        />
        <FormField
          label="Person injured"
          value={personInjured}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPersonInjured(e.target.value)
          }
        />
      </div>

      <RadioGroup
        label="Incident reported to management"
        value={managementReport}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setManagementReport(e.target.value as Yn)
        }
      />

      <FormField
        label="Remarks"
        value={remarks}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setRemarks(e.target.value)
        }
        textarea
      />

      <RadioGroup
        label="Incident reported to Police/ SCDF"
        value={policeReport}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPoliceReport(e.target.value as Yn)
        }
      />
      <RadioGroup
        label="Any damage to the property"
        value={damageProperty}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setDamageProperty(e.target.value as Yn)
        }
      />
      <RadioGroup
        label="Any picture attached"
        value={pictureAttached}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPictureAttached(e.target.value as Yn)
        }
      />
      <RadioGroup
        label="Any CCTV footage"
        value={cctvFootage}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCctvFootage(e.target.value as Yn)
        }
      />

      <div className="flex flex-col gap-2 mt-2">
        <p className="text-sm">Upload captured images</p>
        <label className="border border-[#EFBF04] text-[#EFBF04] rounded-full w-fit px-3 py-3 text-center cursor-pointer">
          Upload files
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
        {images.length > 0 && (
          <p className="text-xs text-gray-300">
            {images.length} file(s) selected
          </p>
        )}
      </div>

      <FormField
        label="Detail of Incident"
        value={detail}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setDetail(e.target.value)
        }
        textarea
      />
      <div className="flex flex-col gap-1 bg-[#222630] w-full p-4 rounded-md">
        <select
          value={acknowledgedBy}
          onChange={(e) => setAcknowledgedBy(e.target.value)}
          className="bg-[#222630] text-[#F4F7FF] outline-none"
        >
          <option value="" disabled hidden>
            Select user
          </option>
          {user && (
            <option value={user.id}>
              {user.name}
            </option>
          )}
        </select>
      </div>



      <div className="flex flex-col gap-4 justify-center items-center pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className="gap-3 w-full bg-[#EFBF04] text-[#181D26] rounded-full flex justify-center items-center py-3"
        >
          Save Report
        </button>
      </div>
    </div>
  );
};

export default Report;

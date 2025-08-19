import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { redirect, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import { setUser } from "../../../features/user/userSlice";
import employeeService from "../../../services/employeeService";
import roleService from "../../../services/roleService";
import { RootState } from "../../../store";
import BottomNavBar from "../components/BottomBar";
import Swal from "sweetalert2";

type Props = {
    label: string;
    name: string;
    type?: React.HTMLInputTypeAttribute;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    readOnly?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    required?: boolean;
    className?: string;
};

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [form, setForm] = useState({
        name: user?.name || "",
        mobile: user?.mobile || "",
        email: user?.email || "",
        birth: toDateInput(user?.employee?.birth) || "",
        nric_fin_no: user?.employee?.nric_fin_no || "",
        role_id: user?.role?.id || "",
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const FormField: React.FC<Props> = ({
        label, name, type = "text", value, onChange,
        placeholder, error, readOnly, disabled, autoComplete, required, className
    }) => (
        <div className={`flex flex-col gap-1 bg-[#222630] w-full p-3 border-b rounded-md ${className || ""}`}>
            <label htmlFor={name} className="text-xs text-[#98A1B3]">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                readOnly={readOnly}
                disabled={disabled}
                required={required}
                className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3] outline-none"
            />
            {error ? <span className="text-xs text-red-400">{error}</span> : null}
        </div>
    );

    function toDateInput(value?: string | null) {
        if (!value) return "";
        const s = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);

        if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) return s.replace(/\//g, "-");

        const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) {
            const [, dd, mm, yyyy] = m;
            return `${yyyy}-${mm}-${dd}`;
        }

        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        }

        return "";
    }

    useEffect(() => {
        setForm({
            name: user?.name || "",
            mobile: user?.mobile || "",
            email: user?.email || "",
            birth: toDateInput(user?.employee?.birth) || "",
            nric_fin_no: user?.employee?.nric_fin_no || "",
            role_id: user?.role?.id || "",
        });
    }, [user?.id]);

    const roleName = useMemo(() => user?.role?.name ?? "-", [user?.role?.name]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setForm((s) => ({ ...s, role_id: value }));
        setSelectedRoleId(value);
    };

    const onSubmit = async () => {
        setSaving(true);
        setErrors({});
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error('You must login first');
                return redirect('/auth/login');
            }


            const payload = {
                name: form.name.trim(),
                mobile: form.mobile?.trim() || undefined,
                email: form.email.trim(),
                birth: form.birth || undefined,
                nric_fin_no: form.nric_fin_no?.trim() || undefined,
                role_id: form.role_id || undefined,
            };

            const res = await employeeService.updateProfile(token, payload, user?.id);

            if (res.success) {
                dispatch(setUser(res.user));
                Swal.fire({
                    title: "Success!",
                    text: "Profile updated successfully.",
                    icon: "success",
                    background: "#1e1e1e",
                    confirmButtonColor: "#EFBF04",
                    color: "#f4f4f4",
                    customClass: { popup: "swal2-dark-popup" },
                });
            }
        } catch (err: any) {
            if (err?.response?.status === 422 && err?.response?.data?.errors) {
                const valErr = err.response.data.errors as Record<string, string[]>;
                const flat: Record<string, string> = {};
                Object.entries(valErr).forEach(([k, v]) => (flat[k] = v[0]));
                setErrors(flat);
                toast.error("Please check your input");
            } else {
                toast.error("Failed to update profile");
            }
        } finally {
            setSaving(false);
        }
    };

    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState(user?.role?.id || "");

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await roleService.getAllRoles();
            if (response.success) {
                setRoles(response.data);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-8 py-20">
            <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
                <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Profile</h1>
            </div>

            <div className="flex flex-col gap-6">
                <FormField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />
                <FormField
                    label="Mobile number"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    error={errors.mobile}
                    placeholder="+65 8123 4567"
                    autoComplete="tel"
                />
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                    required
                />
                <FormField
                    label="NRIC/FIN"
                    name="nric_fin_no"
                    value={form.nric_fin_no}
                    onChange={handleChange}
                    error={errors.nric_fin_no}
                />
                <div className="flex flex-col gap-1 bg-[#222630] w-full p-3 border-b rounded-md">
                    <label htmlFor="role" className="text-xs text-[#98A1B3]">Role</label>
                    <select
                        id="role"
                        name="role_id"
                        value={form.role_id}
                        onChange={handleRoleChange}
                        disabled
                        className="bg-[#222630] text-[#F4F7FF] outline-none"
                    >
                        <option value="">-- Select Role --</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {errors.role_id ? <span className="text-xs text-red-400">{errors.role_id}</span> : null}
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={saving}
                className={`pt-4 bg-[#FFC107] text-[#181D26] font-medium text-base py-3 rounded-full disabled:opacity-60`}
            >
                {saving ? <Loader primary /> : "Save"}
            </button>

            <BottomNavBar />
        </div>
    );
};

export default Profile;

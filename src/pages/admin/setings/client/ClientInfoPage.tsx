import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader";
import Navbar from "../../../../components/Navbar";
import MainLayout from "../../../../layouts/MainLayout";
import auditTrialsService from "../../../../services/auditTrailsService";
import clientInfoService from "../../../../services/clientInfoService";
import { RootState } from "../../../../store";
import { Client } from "../../../../types/client";

const ClientInfoPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const token = useSelector((state: RootState) => state.token.token);
    const { t } = useTranslation();

    const [client, setClient] = useState<Client>({
        id: "",
        name: "",
        reg_no: "",
        address: "",
        contact: "",
        website: "",
        email: "",
        logo: "",
        chart: "",
    });

    const [name, setName] = useState("");
    const [reg, setReg] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const chartInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [chartName, setChartName] = useState<string | null>(null);
    const [chartFile, setChartFile] = useState<File | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const baseURL = new URL(process.env.REACT_APP_API_URL || "http://localhost:8000/api");
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some((p) => p.name === permissionName);
    };

    const fetchClientInfo = async () => {
        if (!token) return navigate("/auth/login");
        setLoading(true);
        try {
            const response = await clientInfoService.getData();
            // console.log(response);
            if (response.success) setClient(response.data);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to load client info");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!token) return navigate("/auth/login");

        try {
            setSaving(true);

            const toBase64 = (file: File) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = { name, reg_no: reg, address, contact, website, email, logo: imageBase64, chart: chartBase64 };
            const response = await clientInfoService.updateData(token, payload, client.id);

            if (response.success) {
                toast.success("Client Info Updated successfully");

                setImageFile(null);
                setImageName(null);
                setChartFile(null);
                setChartName(null);

                await fetchClientInfo();
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const audit = async () => {
        if (!token) return;
        try {
            await auditTrialsService.storeAuditTrails(token, user?.id, "Access client info page", `User ${user?.email} accessed client info page`, "success", "access client info");
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!hasPermission('show_client')) {
            navigate('/dashboard');
            return;
        }
        fetchClientInfo();
        audit();
    }, []);

    useEffect(() => {
        setName(client.name);
        setReg(client.reg_no);
        setAddress(client.address);
        setContact(client.contact);
        setWebsite(client.website);
        setEmail(client.email);
    }, [client]);

    return (
        <MainLayout>
            <div className="flex flex-col gap-4 px-6 pb-20 w-full h-full">
                <h2 className="text-2xl leading-9 text-white font-noto">{t('Settings')}</h2>
                <div className="flex flex-col gap-8 w-full h-full">
                    <Navbar />
                    {loading ? (
                        <div className="bg-[#252C38] p-6 rounded-lg w-full h-full flex justify-center">
                            <Loader primary />
                        </div>
                    ) : (
                        <div className="flex gap-6 flex-col xl:flex-row">

                            {/* Client Info */}
                            <div className="flex flex-col w-full gap-6 xl:max-w-80">
                                <div className="flex flex-col gap-4 bg-[#252C38] xl:max-w-80 w-full h-fit p-4 rounded-lg">
                                    <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">{client.name}</p>

                                    {[
                                        { label: 'Reg. No', value: client.reg_no },
                                        { label: 'Address', value: client.address },
                                        { label: 'Contact', value: client.contact },
                                        { label: 'Website', value: client.website },
                                        { label: 'Email', value: client.email },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <label className="text-xs text-[#98A1B3]">{item.label}</label>
                                            <p className="text-base leading-[20px] text-[#F4F7FF]">{item.value}</p>
                                        </div>
                                    ))}

                                    {/* Management Chart */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs leading-[21px] text-[#98A1B3]">Management chart</label>
                                        <div>
                                            <img
                                                src={`${baseURL || "http://localhost:8000/api"}storage/${client.chart}`}
                                                onClick={() => setIsOpen(true)}
                                                className="cursor-pointer"
                                            />
                                            {isOpen && (
                                                <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                                                    key="add-overlay"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="p-6 bg-[#252C38] rounded-2xl shadow-xl max-w-2xl w-full flex flex-col gap-6">
                                                        <div className="flex justify-between items-center">
                                                            <h2 className="text-xl font-semibold text-white">Management Chart</h2>
                                                            <button
                                                                onClick={() => setIsOpen(false)}
                                                                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                        <img
                                                            src={`${baseURL || "http://localhost:8000/api"}storage/${client.chart}`}
                                                            alt="Management Chart"
                                                            className="mx-auto max-h-[400px] object-contain"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 justify-between gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3">
                                    {["Sites", "Employees", "Assigned", "Unassigned", "On leave"].map((label, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl"
                                        >
                                            <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">{label}</p>
                                            <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">
                                                {loading ? (
                                                    <span className="inline-block h-6 w-10 bg-white/10 rounded animate-pulse" />
                                                ) : (
                                                    ["4", "12", "10", "1", "1"][i]
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="w-full p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8"
                            >
                                <fieldset className="flex flex-col gap-6">
                                    {[
                                        { label: "Company name", value: name, setter: setName, placeholder: "Company name" },
                                        { label: "Reg No.", value: reg, setter: setReg, placeholder: "Reg No." },
                                        { label: "Address with postal code", value: address, setter: setAddress, placeholder: "Address with postal code" },
                                        { label: "Contact", value: contact, setter: setContact, isPhone: true },
                                        { label: "Website", value: website, setter: setWebsite, placeholder: "Website" },
                                        { label: "Email", value: email, setter: setEmail, placeholder: "Email" },
                                    ].map((field, i) => (
                                        <div key={i} className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                            <label className="text-xs leading-[21px] text-[#98A1B3]">{field.label}</label>
                                            {field.isPhone ? (
                                                <PhoneInput
                                                    country="sg"
                                                    value={field.value}
                                                    enableLongNumbers={true}
                                                    onChange={(phone) => {
                                                        const onlyNumbers = phone.replace(/\s/g, "");
                                                        field.setter(`+${onlyNumbers}`);
                                                    }}
                                                    inputProps={{ inputMode: "tel" }}
                                                    inputStyle={{ backgroundColor: "#222834", color: "#F4F7FF", border: "none", width: "100%" }}
                                                    buttonStyle={{ backgroundColor: "#222834", border: "none" }}
                                                    containerStyle={{ backgroundColor: "#222834" }}
                                                    dropdownStyle={{ backgroundColor: "#2f3644", color: "#fff" }}
                                                    placeholder="Mobile"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base focus:outline-none"
                                                    placeholder={field.placeholder}
                                                    value={field.value}
                                                    onChange={(e) => field.setter(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Uploads */}
                                    {[
                                        { label: "Site image", file: imageFile, setFile: setImageFile, name: imageName, setName: setImageName, ref: imageInputRef, src: client.logo },
                                        { label: "Organisation chart", file: chartFile, setFile: setChartFile, name: chartName, setName: setChartName, ref: chartInputRef, src: client.chart },
                                    ].map((upload, i) => (
                                        <div key={i} className="flex flex-col gap-3">
                                            <label className="text-xs leading-[21px] text-[#98A1B3]">
                                                {upload.label} <span className="text-xs">(Maximum image size is 5MB!)</span>{" "}
                                                <span className="text-red-500 text-[10px]">* Do not upload if you don't want to make changes</span>
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => upload.ref.current?.click()}
                                                    className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit hover:bg-[#EFBF04] hover:text-[#252C38] transition-all"
                                                >
                                                    Upload file
                                                </button>
                                                {upload.name && <span className="text-sm text-[#98A1B3]">{upload.name}</span>}
                                            </div>
                                            {upload.src && (
                                                <img
                                                    src={`${baseURL || "http://localhost:8000/api"}storage/${upload.src}`}
                                                    alt="Image"
                                                    className="h-14 w-fit"
                                                />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={upload.ref}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const maxSizeInBytes = 5 * 1024 * 1024;
                                                        if (file.size > maxSizeInBytes) {
                                                            toast.warning("Maximum file size is 5MB!");
                                                            e.target.value = "";
                                                            return;
                                                        }
                                                        upload.setName(file.name);
                                                        upload.setFile(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </div>
                                    ))}
                                </fieldset>

                                {/* Submit */}
                                {hasPermission("edit_client") && (
                                    <button type="submit" disabled={saving || loading} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04] w-full sm:w-fit">
                                        {loading ? <Loader primary={true} /> : 'Save'}
                                    </button>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout >

    );
};

export default ClientInfoPage;

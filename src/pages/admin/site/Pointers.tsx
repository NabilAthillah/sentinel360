import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import SidebarLayout from "../../../components/SidebarLayout";
import SecondLayout from "../../../layouts/SecondLayout";
import pointerService from "../../../services/pointerService";
import siteService from "../../../services/siteService";
import { RootState } from "../../../store";
import { Pointer } from "../../../types/pointer";
import { Route } from "../../../types/route";

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
const Pointers = () => {
    const [sidebar, setSidebar] = useState(true);
    const { t } = useTranslation();
    const [addData, setAddData] = useState(false);
    const [editData, setEditData] = useState(false);
    const [pointers, setPointers] = useState<Pointer[]>([]);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const location = useLocation();
    const { pathname } = location;
    const token = useSelector((state: RootState) => state.token.token);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Pointer | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredPointers = pointers.filter((item) => {
        const query = search.toLowerCase();
        return (
            item.route?.name?.toLowerCase().includes(query) ||
            item.nfc_tag?.toLowerCase().includes(query) ||
            item.remarks?.toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredPointers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredPointers.slice(startIndex, startIndex + itemsPerPage);

    const [addPayload, setAddPayload] = useState({
        name: "",
        nfc_tag: "",
        remarks: "",
        id_route: "",
        id_site: params.idSite,
    });

    const [editedPointer, setEditedPointer] = useState<Pointer | undefined>(
        undefined
    );

    const [editPayload, setEditPayload] = useState({
        name: "",
        nfc_tag: "",
        remarks: "",
        id_route: "",
        id_site: String(params.idSite ?? ""),
    });

    const openDelete = (p: Pointer) => {
        setDeleteTarget(p);
        setDeleteModal(true);
    };

    const openEdit = (p: Pointer) => {
        setEditedPointer(p);
        setEditPayload({
            name: p.name ?? "",
            nfc_tag: p.nfc_tag ?? "",
            remarks: p.remarks ?? "",
            id_route: p.route?.id ?? "",
            id_site: String(params.idSite ?? ""),
        });
        setEditData(true);
    };

    const fetchPointers = async () => {
        setLoading(true);
        try {
            const response = await pointerService.getAllPointers();

            if (response.success) {
                setPointers(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            setLoading(true);

            const response = await siteService.getSiteById(params.idSite, token);
            console.log(response);

            if (response.success) {
                setRoutes(response.data.site.routes);
            }
        } catch (error: any) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        if (addPayload.id_route === "") {
            toast.error("Route is required");
            return;
        }
        try {
            const response = await pointerService.storePointer(addPayload);

            if (response.success) {
                toast.success("Pointer created successfully");
                setAddPayload({
                    name: "",
                    nfc_tag: "",
                    remarks: "",
                    id_route: "",
                    id_site: params.idSite,
                });
                setAddData(false);
                fetchPointers();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message ?? "Oops! Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!editedPointer?.id) return;
        if (!editPayload.id_route) {
            toast.error("Route is required");
            return;
        }

        setLoading(true);
        try {
            const res = await pointerService.updatePointer(
                editedPointer.id,
                editPayload
            );
            if (res.success) {
                toast.success("Pointer updated successfully");
                setEditData(false);
                setEditedPointer(undefined);
                fetchPointers();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? "Oops! Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget?.id) return;
        setLoading(true);
        try {
            const res = await pointerService.deletePointer(deleteTarget.id);
            if (res.success) {
                toast.success("Pointer deleted");
                setPointers((prev) => prev.filter((p) => p.id !== deleteTarget.id));
                setDeleteModal(false);
                setDeleteTarget(null);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? "Oops! Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPointers();
        fetchRoutes();
    }, []);

    const getStatusClasses = (status?: string) => {
        const s = (status ?? "").toLowerCase().trim();

        if (s === "incomplete") return "bg-[#FF7C6A1A] text-[#FF7C6A]";
        if (s === "to do") return "bg-[#FFA5001A] text-[#FFA500]";
        if (s === "complete") return "bg-[#19CE741A] text-[#19CE74]";

        return "bg-[#98A1B31A] text-[#98A1B3]";
    };

    return (
        <SecondLayout>
            <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
                <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
                <nav className="flex flex-wrap">
                    <Link
                        to={`/dashboard/sites/${params.idSite}/routes`}
                        className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === `/dashboard/sites/${params.idSite}/routes`
                            ? "pt-[14px] pb-3 border-b-2 border-b-[#F3C511]"
                            : "py-[14px] border-b-0"
                            }`}
                    >
                        {t("Routes")}
                    </Link>
                    <Link
                        to={`/dashboard/sites/${params.idSite}/pointers`}
                        className={`font-medium text-sm text-[#F4F7FF] px-6 ${pathname === `/dashboard/sites/${params.idSite}/pointers`
                            ? "pt-[14px] pb-3 border-b-2 border-b-[#F3C511]"
                            : "py-[14px] border-b-0"
                            }`}
                    >
                        {t("Pointers")}
                    </Link>
                </nav>
                <div className="flex flex-col gap-6 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="w-full md:w-[400px] flex items-center bg-[#222834] border-b border-[#98A1B3] rounded-t-md">
                            <input
                                type="text"
                                className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-t-md text-[#F4F7FF] placeholder:text-[#98A1B3] text-base focus:outline-none"
                                placeholder={t("Search")}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <button type="button" className="p-2" tabIndex={-1}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    version="1.1"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                >
                                    <defs>
                                        <clipPath id="master_svg0_247_12873">
                                            <rect x="0" y="0" width="32" height="32" rx="0" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#master_svg0_247_12873)">
                                        <g>
                                            <path
                                                d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z"
                                                fill="#98A1B3"
                                                fillOpacity="1"
                                            />
                                        </g>
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => setAddData(true)}
                            className="font-medium text-base text-[#181d26] px-[46.5px] py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                        >
                            {t("Add pointers")}
                        </button>
                    </div>
                    <div className="w-full h-full relative flex flex-1 pb-10">
                        <div className="w-full h-fit overflow-auto pb-5">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">
                                            {t("S.no")}
                                        </th>
                                        <th className="font-semibold text-[#98A1B3] text-start">
                                            {t("Pointer name")}
                                        </th>
                                        <th className="font-semibold text-[#98A1B3] text-start">
                                            {t("Route name")}
                                        </th>
                                        <th className="font-semibold text-[#98A1B3] text-start">
                                            {t("NFC Tag")}
                                        </th>
                                        <th className="font-semibold text-[#98A1B3] text-start">
                                            {t("Remaks")}
                                        </th>
                                        <th className="font-semibold text-[#98A1B3] text-center">
                                            {t("Actions")}
                                        </th>
                                    </tr>
                                </thead>
                                {loading ? (
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
                                        {pointers.length > 0 ? (
                                            pointers.map((data, index) => (
                                                <tr>
                                                    <td className="text-[#F4F7FF] font-inter">
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-[#F4F7FF] font-inter">
                                                        {data.name}
                                                    </td>
                                                    <td className="text-[#F4F7FF] font-inter">
                                                        {data.route.name}
                                                    </td>
                                                    <td className="text-[#F4F7FF] font-inter">
                                                        {data.nfc_tag}
                                                    </td>
                                                    <td className="text-[#F4F7FF] font-inter">{data.remarks ?? '-'}</td>

                                                    <td className="pt-6 pb-3">
                                                        <div className="flex gap-6 items-center justify-center">
                                                            <svg
                                                                onClick={() => openEdit(data)}
                                                                className="cursor-pointer"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M0 18V13.75L13.2 0.575C13.4 0.391667 13.6208 0.25 13.8625 0.15C14.1042 0.05 14.3583 0 14.625 0C14.8917 0 15.15 0.05 15.4 0.15C15.65 0.25 15.8667 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15 18 3.4C18 3.66667 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L4.25 18H0ZM14.6 4.8L16 3.4L14.6 2L13.2 3.4L14.6 4.8Z"
                                                                    fill="#F9F9F9"
                                                                />
                                                            </svg>
                                                            <svg
                                                                onClick={() => openDelete(data)}
                                                                className="cursor-pointer"
                                                                width="16"
                                                                height="18"
                                                                viewBox="0 0 16 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                                                                    fill="#F9F9F9"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center text-white py-6">
                                                    {t("No pointers found.")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-3 absolute bottom-0 right-0">
                            <button className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50">
                                <ArrowLeft size={14} />
                                {t("Previous")}
                            </button>
                            <button
                                disabled
                                className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B] rounded-md"
                            ></button>
                            <button className="flex items-center gap-1 font-medium text-xs leading-[21px] text-[#B3BACA] disabled:opacity-50">
                                {t("Next")}
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SlideOver
                isOpen={addData}
                onClose={() => setAddData(false)}
                ariaTitle="Add Pointers"
                width={568}
            >
                {addData && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6 p-6 h-full"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl leading-[36px] text-white font-noto">
                                Add Pointers
                            </h2>
                            <button
                                type="button"
                                onClick={() => setAddData(false)}
                                className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                placeholder="Pointer Name"
                                onChange={(e) => {
                                    setAddPayload((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }));
                                }}
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <select
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                onChange={(e) =>
                                    setAddPayload((prev) => ({
                                        ...prev,
                                        id_route: e.target.value,
                                    }))
                                }
                                value={addPayload.id_route ?? ""}
                                required
                            >
                                <option value="" disabled>
                                    — Select route —
                                </option>
                                {routes.length > 0 &&
                                    routes.map((route) => (
                                        <option
                                            value={route.id}
                                            key={route.id}
                                            className="capitalize"
                                        >
                                            {route.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                placeholder="NFC Tag"
                                onChange={(e) => {
                                    setAddPayload((prev) => ({
                                        ...prev,
                                        nfc_tag: e.target.value,
                                    }));
                                }}
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                                placeholder="Remarks (Optional)"
                                onChange={(e) => {
                                    setAddPayload((prev) => ({
                                        ...prev,
                                        remarks: e.target.value,
                                    }));
                                }}
                            />
                        </div>

                        <div className="flex gap-4 mt-auto flex-wrap pt-12">
                            <button
                                type="submit"
                                className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                            >
                                Confirm
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddData(false)}
                                className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </SlideOver>

            <SlideOver
                isOpen={editData}
                onClose={() => {
                    setEditData(false);
                    setEditedPointer(undefined);
                }}
                ariaTitle="Edit Pointer"
                width={568}
            >
                {editData && (
                    <form
                        onSubmit={handleUpdate}
                        className="flex flex-col gap-6 p-6 h-full"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl leading-[36px] text-white font-noto">
                                Edit Pointer
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditData(false);
                                    setEditedPointer(undefined);
                                }}
                                className="text-[#98A1B3] hover:text-white text-xl leading-none px-1"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Poinnter Name</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                                placeholder="Pointer name"
                                value={editPayload.name}
                                onChange={(e) =>
                                    setEditPayload((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Route */}
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Route</label>
                            <select
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base focus-visible:outline-none"
                                value={editPayload.id_route}
                                onChange={(e) =>
                                    setEditPayload((prev) => ({
                                        ...prev,
                                        id_route: e.target.value,
                                    }))
                                }
                                required
                            >
                                {routes.length === 0 && (
                                    <option value="">Loading routes...</option>
                                )}
                                {routes.map((route) => (
                                    <option
                                        value={route.id}
                                        key={route.id}
                                        className="capitalize"
                                    >
                                        {route.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* NFC Tag */}
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">NFC Tag</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                                placeholder="NFC Tag"
                                value={editPayload.nfc_tag}
                                onChange={(e) =>
                                    setEditPayload((prev) => ({
                                        ...prev,
                                        nfc_tag: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Remarks */}
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                            <label className="text-xs text-[#98A1B3]">Remarks</label>
                            <input
                                type="text"
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                                placeholder="Remarks (Optional)"
                                value={editPayload.remarks}
                                onChange={(e) =>
                                    setEditPayload((prev) => ({
                                        ...prev,
                                        remarks: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 bottom flex-wrap mt-auto pt-12">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] disabled:opacity-60"
                            >
                                {loading ? <Loader primary /> : 'Confirm'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditData(false);
                                    setEditedPointer(undefined);
                                }}
                                className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </SlideOver>
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !loading && setDeleteModal(false)}
                        aria-hidden
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Delete pointer"
                            className="w-full max-w-md bg-[#252C38] rounded-2xl shadow-xl border border-[#3A4250]"
                            initial={{ y: 30, scale: 0.98, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 30, scale: 0.98, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 pt-6">
                                <h3 className="text-white text-xl font-semibold">
                                    Delete pointer?
                                </h3>
                                <p className="text-[#B3BACA] mt-2 text-sm">
                                    You are about to delete this pointer
                                    {deleteTarget?.nfc_tag ? (
                                        <>
                                            {" "}
                                            with NFC Tag{" "}
                                            <span className="text-white font-medium">
                                                {deleteTarget.nfc_tag}
                                            </span>
                                        </>
                                    ) : null}
                                    . This action cannot be undone.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="px-6 mt-4">
                                <div className="text-xs text-[#98A1B3] space-y-1">
                                    <div className="flex gap-2">
                                        <span className="min-w-[80px]">Route</span>
                                        <span className="text-white">
                                            {deleteTarget?.route?.name ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="min-w-[80px]">Pointer</span>
                                        <span className="text-white">
                                            {deleteTarget?.name ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModal(false)}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-full border border-[#868686] text-[#B3BACA] hover:bg-[#303847] disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-full bg-[#FF7E6A] text-[#181D26] font-semibold hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? <Loader primary /> : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SecondLayout>
    );
};

export default Pointers;

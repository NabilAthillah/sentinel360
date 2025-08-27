import { Switch } from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal";
import Loader from "../../../components/Loader";
import SecondLayout from "../../../layouts/SecondLayout";
import auditTrialsService from "../../../services/auditTrailsService";
import routeService from "../../../services/routeService";
import siteService from "../../../services/siteService";
import { RootState } from "../../../store";
import { Route } from "../../../types/route";
import { Site } from "../../../types/site";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDndMonitor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SidebarLayout from "../../../components/SidebarLayout";

/* ------------------------------ UI Helpers ------------------------------ */

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

/* --------------------------- DnD UI components -------------------------- */

const chipBase =
  "relative w-10 h-10 rounded-full flex items-center justify-center text-[#F4F7FF] bg-[#434A57] text-sm select-none";

function AvailableChip({ id, label }: { id: string; label: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`${chipBase}`}
    >
      {label}
    </div>
  );
}

function SortableChip({
  id,
  label,
  onRemove,
}: {
  id: string;
  label: number;
  onRemove: (n: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${chipBase}`}
    >
      {label}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(label);
        }}
        className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-[#FF7E6A] text-[10px] leading-4 text-white"
        aria-label="remove"
        title="remove"
      >
        ×
      </button>
    </div>
  );
}

function DroppableRow({
  id,
  children,
  isEmpty,
}: {
  id: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex gap-4 p-4 bg-[#222834] rounded-md min-h-[56px] items-center
                  overflow-x-auto flex-nowrap ${isOver ? "outline outline-2 outline-[#EFBF04]" : ""
        }`}
    >
      {isEmpty ? (
        <span className="text-[#98A1B3] text-sm">Drop pointers here…</span>
      ) : (
        children
      )}
    </div>
  );
}

function DndMonitor({
  setDragging,
  setOverId,
}: {
  setDragging: (v: boolean) => void;
  setOverId: (v: string | null) => void;
}) {
  useDndMonitor({
    onDragStart() {
      setDragging(true);
    },
    onDragOver(event) {
      setOverId(event.over ? String(event.over.id) : null);
    },
    onDragCancel() {
      setDragging(false);
      setOverId(null);
    },
    onDragEnd() {
      setDragging(false);
      setOverId(null);
    },
  });
  return null; // tak render apa pun
}

/* --------------------------------- Page --------------------------------- */

const RoutePage = () => {
  const params = useParams();
  const location = useLocation();
  const { pathname } = location;
  const [addData, setAddData] = useState(false);
  const [editData, setEditData] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>();
  const [deleteRoute, setDeleteRoute] = useState<Route | null>();
  const [remarks, setRemarks] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [site, setSite] = useState<Site>();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [sidebar, setSidebar] = useState(true)

  /** Demo data pointer (1..5). Ganti sesuai data dari API kalau perlu */
  const [pointers, setPointers] = useState<number[]>([1, 2, 3, 4, 5]);

  /** List yang sudah dikonfirmasi urutannya */
  const [confirmRoute, setConfirmRoute] = useState<number[]>([]);

  /** Tersisa = pointers - confirmRoute */
  const availablePointers = useMemo(
    () => pointers.filter((p) => !confirmRoute.includes(p)),
    [pointers, confirmRoute]
  );

  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.token.token);
  const navigate = useNavigate();

  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
    site?.routes?.reduce((acc, route) => {
      acc[route.id] = route.status === "active";
      return acc;
    }, {} as Record<string, boolean>) ?? {}
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [dragging, setDragging] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);

  const showConfirmPlaceholder =
    dragging &&
    (overId === "confirmZone" || (overId?.startsWith("confirm:") ?? false));

  const handleToggle = async (id: string) => {
    const prevStatus = switchStates[id];
    const newStatus = !prevStatus;

    setSwitchStates((prev) => ({
      ...prev,
      [id]: newStatus,
    }));

    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      const response = await routeService.editRouteStatus(
        token,
        id,
        newStatus ? "active" : "deactive"
      );

      if (response.success) {
        toast.success("Route status updated successfully");
        fetchSite();
      }
    } catch (error) {
      console.error(error);
      setSwitchStates((prev) => ({
        ...prev,
        [id]: prevStatus,
      }));
      toast.error("Failed to update route status");
    }
  };

  const fetchSite = async () => {
    try {
      setLoading(true);
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const response = await siteService.getSiteById(params.idSite, token);
      console.log(response);

      if (response.success) {
        setSite(response.data.site);
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

    try {
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const response = await routeService.addRoute(token, params.idSite, name, remarks, confirmRoute.join(","));

      if (response.success) {
        toast.success("Route created successfully");
        fetchSite();
        setLoading(false);
        setAddData(false);
        setName("");
        setConfirmRoute([]);
        setRemarks("");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const response = await routeService.editRoute(token, editRoute?.id, name, remarks, confirmRoute.join(","));

      if (response.success) {
        toast.success("Route updated successfully");
        fetchSite();
        setLoading(false);
        setEditData(false);
        setName("");
        setRemarks("");
        setConfirmRoute([]);
        setEditRoute(null);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const response = await routeService.deleteRoute(token, deleteRoute);

      if (response.success) {
        toast.success("Route deleted successfully");
        fetchSite();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleteModal(false);
      setDeleteRoute(null);
    }
  };

  const hasPermission = (permissionName: string) => {
    return user?.role?.permissions?.some((p) => p.name === permissionName);
  };

  const audit = async () => {
    try {
      const token = localStorage.getItem("token");
      const title = `Access site route page`;
      const description = `User ${user?.email} access site route page`;
      const status = "success";
      await auditTrialsService.storeAuditTrails(
        token,
        user?.id,
        title,
        description,
        status,
        "access site route"
      );
    } catch (error) {
      console.error(error);
    }
  };

  const PlaceholderCircle = () => (
    <div
      aria-hidden
      className="w-10 h-10 rounded-full border-2 border-dashed border-[#EFBF04] shrink-0"
    />
  );

  useEffect(() => {
    audit();
    if (hasPermission("list_site_routes")) {
      fetchSite();
    } else {
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (site?.routes) {
      const newSwitchStates = site.routes.reduce((acc, route) => {
        acc[route.id] = route.status === "active";
        return acc;
      }, {} as Record<string, boolean>);

      setSwitchStates(newSwitchStates);
    }
  }, [site?.routes]);

  useEffect(() => {
    if (editData && editRoute) {
      setName(editRoute.name);
      setRemarks(editRoute.remarks || "");
      const parsedRoute = editRoute.route
        ? editRoute.route
          .split(",")
          .map((x) => Number(x.trim()))
          .filter((n) => !isNaN(n))
        : [];
      setConfirmRoute(parsedRoute);
    }
  }, [editData, editRoute]);

  /* ------------------------------ DnD logic ------------------------------ */
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [from, aVal] = String(active.id).split(":"); // "available:3" | "confirm:4"
    const to = String(over.id); // "confirmZone" | "availableZone" | "confirm:4"
    const val = Number(aVal);

    // 1) Reorder di dalam confirm: drop di atas chip lain
    if (from === "confirm" && to.startsWith("confirm:")) {
      const overVal = Number(to.split(":")[1]);
      if (val === overVal) return;
      const oldIndex = confirmRoute.indexOf(val);
      const newIndex = confirmRoute.indexOf(overVal);
      setConfirmRoute((cr) => arrayMove(cr, oldIndex, newIndex));
      return;
    }

    // 2) Reorder ke ujung: dari confirm → area kosong confirmZone
    if (from === "confirm" && to === "confirmZone") {
      const oldIndex = confirmRoute.indexOf(val);
      setConfirmRoute((cr) => arrayMove(cr, oldIndex, cr.length - 1));
      return;
    }

    // 3) Tambah dari available → area kosong confirmZone (append)
    if (from === "available" && to === "confirmZone") {
      if (!confirmRoute.includes(val)) {
        setConfirmRoute((cr) => [...cr, val]);
      }
      return;
    }

    // 4) ⬅️ FIX UTAMA: Tambah dari available → di atas chip confirm:<n> (insert)
    if (from === "available" && to.startsWith("confirm:")) {
      const overVal = Number(to.split(":")[1]);
      const idx = confirmRoute.indexOf(overVal);
      if (!confirmRoute.includes(val)) {
        const next = [...confirmRoute];
        next.splice(Math.max(0, idx + 1), 0, val); // insert sebelum chip yang di-hover
        setConfirmRoute(next);
      }
      return;
    }

    // 5) Kembalikan ke available: dari confirm → availableZone
    if (from === "confirm" && to === "availableZone") {
      setConfirmRoute((cr) => cr.filter((x) => x !== val));
      return;
    }
  };

  return (
    <SecondLayout>
      <div className="flex flex-col gap-6 px-6 pb-20 w-full min-h-[calc(100vh-91px)] h-full xl:pr-[156px]">
        <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
        <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
          <div className="w-full flex justify-between items-center gap-4 flex-wrap md:flex-nowrap">
            <div className="flex items-end gap-4 w-full">
              <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                <input
                  type={"text"}
                  className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                  placeholder="Search"
                />
                <button
                  type="button"
                  className="p-2 rounded-[4px_4px_0px_0px]"
                  tabIndex={-1}
                >
                  {/* search icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    version="1.1"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <defs>
                      <clipPath id="m">
                        <rect x="0" y="0" width="32" height="32" rx="0" />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#m)">
                      <path
                        d="M20.6667 18.6667h-. ,0L19.24 18.3067c1.352-1.568 2.095-3.569 2.093-5.64C21.333 7.88 17.453 4 12.667 4 7.88 4 4 7.88 4 12.667c0 4.786 3.88 8.666 8.667 8.666 2.146 0 4.12-0.786 5.64-1.493l.36.373v1.053l6.667 6.653 1.987-1.987-6.653-6.667Zm-8 0c-3.32 0-6-2.68-6-6 0-3.32 2.68-6 6-6s6 2.68 6 6c0 3.32-2.68 6-6 6Z"
                        fill="#98A1B3"
                      />
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            {hasPermission("add_site_route") && (
              <div className="min-w-[180px] max-w-[200px] w-fit">
                <button
                  onClick={() => setAddData(true)}
                  className="font-medium text-base text-[#181d26] px-[46.5px] py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                >
                  {t("Add Route")}
                </button>
              </div>
            )}
          </div>

          {/* table */}
          <div className="w-full h-full relative flex flex-1 pb-10">
            <div className="w-full h-fit overflow-auto pb-5">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr>
                    <th className="font-semibold text-[#98A1B3] text-start">
                      {t("S/No")}
                    </th>
                    <th className="font-semibold text-[#98A1B3] text-start">
                      {t("Route Name")}
                    </th>
                    <th className="font-semibold text-[#98A1B3] text-start">
                      {t("Status")}
                    </th>
                    <th className="font-semibold text-[#98A1B3] text-center">
                      {t("Action")}
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
                    {site?.routes &&
                      site?.routes?.length > 0 &&
                      site?.routes?.map((route, index) => (
                        <tr key={index}>
                          <td className="text-[#F4F7FF] pt-6 pb-3">
                            {index + 1}
                          </td>
                          <td className="text-[#F4F7FF] pt-6 pb-3 ">
                            {route.name}
                          </td>
                          <td className="text-[#F4F7FF] pt-6 pb-3 ">
                            {hasPermission("edit_site_route") ? (
                              <div className="flex items-center gap-4 w-40">
                                <Switch
                                  id="custom-switch-component"
                                  ripple={false}
                                  checked={switchStates[route.id]}
                                  onChange={() => handleToggle(route.id)}
                                  className="h-full w-full checked:bg-[#446FC7]"
                                  containerProps={{ className: "w-11 h-6" }}
                                  circleProps={{
                                    className:
                                      "before:hidden left-0.5 border-none",
                                  }}
                                  onResize={undefined}
                                  onResizeCapture={undefined}
                                  onPointerEnterCapture={undefined}
                                  onPointerLeaveCapture={undefined}
                                  crossOrigin={undefined}
                                />
                                <p
                                  className={`font-medium text-sm capitalize ${switchStates[route.id]
                                    ? "text-[#19CE74]"
                                    : "text-[#FF7E6A]"
                                    }`}
                                >
                                  {switchStates[route.id] ? "active" : "deactive"}
                                </p>
                              </div>
                            ) : (
                              <p
                                className={`font-medium text-sm capitalize ${switchStates[route.id]
                                  ? "text-[#19CE74]"
                                  : "text-[#FF7E6A]"
                                  }`}
                              >
                                {switchStates[route.id] ? "active" : "deactive"}
                              </p>
                            )}
                          </td>
                          <td className="pt-6 pb-3">
                            <div className="flex gap-6 items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_354_16316"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_354_16316)"><g><path d="M6,8L4,8L4,22C4,23.1,4.9,24,6,24L20,24L20,22L6,22L6,8ZM22,4L10,4C8.9,4,8,4.9,8,6L8,18C8,19.1,8.9,20,10,20L22,20C23.1,20,24,19.1,24,18L24,6C24,4.9,23.1,4,22,4ZM22,18L10,18L10,6L22,6L22,18ZM15,16L17,16L17,13L20,13L20,11L17,11L17,8L15,8L15,11L12,11L12,13L15,13L15,16Z" fill="#F4F7FF" fill-opacity="1" /></g></g></svg>
                              {hasPermission("edit_site_route") && (
                                <svg
                                  onClick={() => {
                                    setEditData(true);
                                    setEditRoute(route);
                                  }}
                                  className="cursor-pointer"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  version="1.1"
                                  width="28"
                                  height="28"
                                  viewBox="0 0 28 28"
                                >
                                  <path
                                    d="M3.5 20.125V24.5H7.875L20.778 11.597 16.403 7.222 3.5 20.125Zm20.662-11.912c.454-.454.454-1.191 0-1.645l-2.73-2.73a1.163 1.163 0 0 0-1.645 0L17.652 5.973 22.027 10.348l2.135-2.135Z"
                                    fill="#F4F7FF"
                                  />
                                </svg>
                              )}
                              {/* {hasPermission("delete_site_route") && ( */}
                              <svg
                                onClick={() => {
                                  setDeleteModal(true);
                                  setDeleteRoute(route);
                                }}
                                className="cursor-pointer"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                version="1.1"
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                              >
                                <path
                                  d="M7 24.5h14V8.167H7V24.5ZM22.166 4.667h-4.083L16.916 3.5h-5.833l-1.167 1.167H5.833V7h16.333V4.667Z"
                                  fill="#F4F7FF"
                                />
                              </svg>
                              {/* )} */}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                )}
              </table>
            </div>
            <div className="grid grid-cols-3 w-fit absolute bottom-0 right-0">
              <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F]">
                {t("prev")}
              </button>
              <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                1
              </button>
              <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F]">
                {t("Next")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ ADD ROUTE ------------------------------ */}
      <SlideOver
        isOpen={addData}
        onClose={() => setAddData(false)}
        ariaTitle="Add Route"
        width={568}
      >
        <form
          className="flex flex-col gap-6 p-6 h-full"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl text-white">Add Route</h2>

          <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
            <input
              type="text"
              className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
              placeholder="Route name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <DndContext
            sensors={sensors}
            onDragEnd={onDragEnd}
            collisionDetection={closestCenter}
          >
            {/* AVAILABLE */}
            <DndMonitor setDragging={setDragging} setOverId={setOverId} />
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[#98A1B3]">
                Drag pointers route below
              </label>
              <DroppableRow
                id="availableZone"
                isEmpty={availablePointers.length === 0}
              >
                {availablePointers.map((n) => (
                  <AvailableChip
                    key={`available:${n}`}
                    id={`available:${n}`}
                    label={n}
                  />
                ))}
              </DroppableRow>

              {/* legend sample, optional */}
              <div className="grid grid-cols-2 gap-y-1 text-sm text-[#98A1B3] px-1">
                <span>1. Section 2 Door</span>
                <span>4. Section 3 garden</span>
                <span>2. Electric box</span>
                <span>5. Fountain</span>
                <span>3. Circuit area</span>
              </div>
            </div>

            {/* CONFIRM */}
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-sm text-[#98A1B3]">
                Confirm pointers route
              </label>

              {/* droppable background for appending */}
              <DroppableRow
                id="confirmZone"
                isEmpty={confirmRoute.length === 0 && !showConfirmPlaceholder}
              >
                <SortableContext
                  items={confirmRoute.map((n) => `confirm:${n}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {confirmRoute.map((n) => (
                    <SortableChip
                      key={`confirm:${n}`}
                      id={`confirm:${n}`}
                      label={n}
                      onRemove={(num) =>
                        setConfirmRoute((cr) => cr.filter((x) => x !== num))
                      }
                    />
                  ))}
                </SortableContext>

                {showConfirmPlaceholder && <PlaceholderCircle />}
              </DroppableRow>
            </div>
          </DndContext>

          <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
            <input
              type="text"
              className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
              placeholder="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="flex gap-4 flex-wrap pt-12 mt-auto">
            <button
              type="submit"
              className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
            >
              {loading ? <Loader primary /> : "Confirm"}
            </button>
            <button
              onClick={() => {
                setAddData(false);
                setConfirmRoute([]);
                setName("");
              }}
              type="button"
              className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      {/* ------------------------------ EDIT / DELETE ------------------------------ */}
      <SlideOver
        isOpen={editData}
        onClose={() => {
          setEditData(false);
          setEditRoute(null);
        }}
        ariaTitle="Edit Route"
        width={568}
      >
        <form
          className="flex flex-col gap-6 p-6 h-full"
          onSubmit={handleEdit}
        >
          <h2 className="text-2xl text-white">Edit Route</h2>

          {/* ROUTE NAME */}
          <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
            <input
              type="text"
              className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
              placeholder="Route name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* DND POINTERS */}
          <DndContext
            sensors={sensors}
            onDragEnd={onDragEnd}
            collisionDetection={closestCenter}
          >
            <DndMonitor setDragging={setDragging} setOverId={setOverId} />

            {/* AVAILABLE */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[#98A1B3]">
                Drag pointers route below
              </label>
              <DroppableRow
                id="availableZone"
                isEmpty={availablePointers.length === 0}
              >
                {availablePointers.map((n) => (
                  <AvailableChip
                    key={`available:${n}`}
                    id={`available:${n}`}
                    label={n}
                  />
                ))}
              </DroppableRow>
            </div>

            {/* CONFIRM */}
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-sm text-[#98A1B3]">
                Confirm pointers route
              </label>
              <DroppableRow
                id="confirmZone"
                isEmpty={confirmRoute.length === 0 && !showConfirmPlaceholder}
              >
                <SortableContext
                  items={confirmRoute.map((n) => `confirm:${n}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {confirmRoute.map((n) => (
                    <SortableChip
                      key={`confirm:${n}`}
                      id={`confirm:${n}`}
                      label={n}
                      onRemove={(num) =>
                        setConfirmRoute((cr) => cr.filter((x) => x !== num))
                      }
                    />
                  ))}
                </SortableContext>
                {showConfirmPlaceholder && <PlaceholderCircle />}
              </DroppableRow>
            </div>
          </DndContext>

          {/* REMARKS */}
          <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
            <input
              type="text"
              className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
              placeholder="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 flex-wrap pt-12 mt-auto">
            <button
              type="submit"
              className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
            >
              {loading ? <Loader primary /> : "Save"}
            </button>
            <button
              onClick={() => {
                setEditData(false);
                setEditRoute(null);
                setConfirmRoute([]);
                setName("");
                setRemarks("");
              }}
              type="button"
              className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      {deleteModal && (
        <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
          <DeleteModal
            loading={loading}
            setModal={setDeleteModal}
            handleDelete={handleDelete}
          />
        </div>
      )}
    </SecondLayout>
  );
};

export default RoutePage;

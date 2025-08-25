import { Switch } from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DeleteModal from '../../../components/DeleteModal';
import Loader from '../../../components/Loader';
import MainLayout from '../../../layouts/MainLayout';
import { Route } from '../../../types/route';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SidebarLayout from '../../../components/SidebarLayout';
function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        if (locked) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = prev || '';
        return () => {
            document.body.style.overflow = prev || '';
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
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
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
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
function SortableItem({ id }: { id: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#3D4451] cursor-grab"
        >
            {id}
        </div>
    );
}
const RoutePage = () => {
    const { t } = useTranslation();
    const [addData, setAddData] = useState(false);
    const [editData, setEditData] = useState(false);
    const [editRoute, setEditRoute] = useState<Route | null>(null);
    const [deleteRoute, setDeleteRoute] = useState<Route | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const [pointers, setPointers] = useState([1, 2, 3, 4, 5]);
    const [confirmRoute, setConfirmRoute] = useState([2, 4, 5]);
    const [sidebar, setSidebar] = useState(true);
    const [routes, setRoutes] = useState<Route[]>([
        { id: 'r1', name: 'Route 1', status: 'active', id_site: '' },
        { id: 'r2', name: 'Route 2', status: 'deactive', id_site: '' },
    ]);

    const handleDragEnd = (event: any, setList: Function, list: number[]) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = list.indexOf(active.id);
            const newIndex = list.indexOf(over.id);
            setList(arrayMove(list, oldIndex, newIndex));
        }
    };
    const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
        routes.reduce((acc, route) => {
            acc[route.id] = route.status === 'active';
            return acc;
        }, {} as Record<string, boolean>)
    );

    const handleToggle = (id: string) => {
        setSwitchStates(prev => {
            const newStatus = !prev[id];
            toast.success(`Route ${id} status changed to ${newStatus ? 'active' : 'deactive'}`);
            return { ...prev, [id]: newStatus };
        });
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const newRoute: Route = {
                id: `r${Date.now()}`,
                name,
                status: 'active',
                id_site: '',
            };
            setRoutes(prev => [...prev, newRoute]);
            setSwitchStates(prev => ({ ...prev, [newRoute.id]: true }));
            setName('');
            setAddData(false);
            setLoading(false);
            toast.success('Route created successfully');
        }, 500);
    };

    const handleEdit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setRoutes(prev =>
                prev.map(r => (r.id === editRoute?.id ? { ...r, name } : r))
            );
            setEditData(false);
            setEditRoute(null);
            setName('');
            setLoading(false);
            toast.success('Route updated successfully');
        }, 500);
    };

    const handleDelete = () => {
        setLoading(true);
        setTimeout(() => {
            setRoutes(prev => prev.filter(r => r.id !== deleteRoute?.id));
            const updatedSwitches = { ...switchStates };
            delete updatedSwitches[deleteRoute!.id];
            setSwitchStates(updatedSwitches);

            setDeleteModal(false);
            setDeleteRoute(null);
            setLoading(false);
            toast.success('Route deleted successfully');
        }, 500);
    };

    useEffect(() => {
        if (editData && editRoute) {
            setName(editRoute.name);
        }
    }, [editData, editRoute]);

    return (
        <MainLayout>
            <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
            <div className="flex flex-col gap-6 pr-[156px] pl-4 pb-20 w-full h-full flex-1">
                <h2 className="text-2xl leading-9 text-white font-noto">{t('Routes')}</h2>
                <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="w-full md:w-[400px] flex items-center bg-[#222834] border-b border-[#98A1B3] rounded-t-md">
                            <input
                                type="text"
                                className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-t-md text-[#F4F7FF] placeholder:text-[#98A1B3] text-base focus:outline-none"
                                placeholder={t("Search")}
                            />
                            <button type="button" className="p-2" tabIndex={-1}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                            </button>
                        </div>
                        <button onClick={() => setAddData(true)} className="bg-[#EFBF04] text-[#181D26] px-6 py-2 rounded-full font-medium hover:bg-[#d4ab0b] transition">
                            {t("Add route")}
                        </button>
                    </div>
                    <div className="w-full h-full relative flex flex-1 pb-10">
                        <div className="w-full h-fit overflow-auto pb-5">
                            <table className="min-w-[700px] w-full">
                                <thead>
                                    <tr>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('S/No')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Route Name')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-start">{t('Status')}</th>
                                        <th className="font-semibold text-[#98A1B3] text-center">{t('Action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map((route, index) => (
                                        <tr key={route.id}>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{index + 1}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">{route.name}</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">
                                                <div className="flex items-center gap-4 w-40">

                                                </div>
                                            </td>
                                            <td className="pt-6 pb-3 text-center">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <svg className="cursor-pointer"
                                                        onClick={() => navigate("/dashboard/sites/routes/pointers")} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H18C19.1 20 20 19.1 20 18V2C20 0.9 19.1 0 18 0ZM18 18H2V2H18V18ZM16 4H11C9.9 4 9 4.9 9 6V8.28C8.4 8.63 8 9.26 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 9.26 11.6 8.62 11 8.28V6H14V14H6V6H8V4H4V16H16V4Z" fill="#F9F9F9" />
                                                    </svg>


                                                    <svg onClick={() => {
                                                        setEditData(true);
                                                    }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3ZM17.6 7.8L19 6.4L17.6 5L16.2 6.4L17.6 7.8Z" fill="#F9F9F9" />
                                                    </svg>

                                                    <svg onClick={() => {
                                                        setDeleteModal(true);
                                                    }}
                                                        width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" fill="#F9F9F9" />
                                                    </svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            <SlideOver isOpen={addData} onClose={() => setAddData(false)} ariaTitle="Add Route" width={568}>
                <form className="flex flex-col gap-6 p-6 h-full">
                    <h2 className="text-2xl text-white">Add Route</h2>
                    <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                            placeholder="Route name"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-[#98A1B3]">Drag pointers route below</label>
                        <div className="flex gap-4 p-4 bg-[#222834] rounded-md">
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, setPointers, pointers)}
                            >
                                <SortableContext items={pointers} strategy={horizontalListSortingStrategy}>
                                    {pointers.map((id) => (
                                        <SortableItem key={id} id={id} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm text-[#98A1B3] px-1">
                            <span>1. Section 2 Door</span>
                            <span>4. Section 3 Garden</span>
                            <span>2. Electric box</span>
                            <span>5. Fountain</span>
                            <span>3. Circuit area</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-[#98A1B3]">Confirm pointers route</label>
                        <div className="flex gap-4 p-4 bg-[#222834] rounded-md">
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, setConfirmRoute, confirmRoute)}
                            >
                                <SortableContext items={confirmRoute} strategy={horizontalListSortingStrategy}>
                                    {confirmRoute.map((id) => (
                                        <div key={id} className="relative">
                                            <SortableItem id={id} />
                                            <button
                                                type="button"
                                                onClick={() => setConfirmRoute(confirmRoute.filter((i) => i !== id))}
                                                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <div className="w-10 h-10 rounded-full border border-dashed border-yellow-500 flex items-center justify-center text-yellow-500">
                                +
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                            placeholder="Remarks (Optional)"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap pt-12 mt-auto  bottom ">
                        <button
                            type="submit"
                            className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setAddData(false)}
                            type="button"
                            className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </SlideOver>

            <SlideOver isOpen={editData} onClose={() => setEditData(false)} ariaTitle="Edit Data" width={568}>
                <form className="flex flex-col gap-6 p-6 h-full">
                    <h2 className="text-2xl text-white">Edit Route</h2>
                    <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                            placeholder="Route name"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-[#98A1B3]">Drag pointers route below</label>
                        <div className="flex gap-4 p-4 bg-[#222834] rounded-md">
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, setPointers, pointers)}
                            >
                                <SortableContext items={pointers} strategy={horizontalListSortingStrategy}>
                                    {pointers.map((id) => (
                                        <SortableItem key={id} id={id} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm text-[#98A1B3] px-1">
                            <span>1. Section 2 Door</span>
                            <span>4. Section 3 Garden</span>
                            <span>2. Electric box</span>
                            <span>5. Fountain</span>
                            <span>3. Circuit area</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-[#98A1B3]">Confirm pointers route</label>
                        <div className="flex gap-4 p-4 bg-[#222834] rounded-md">
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, setConfirmRoute, confirmRoute)}
                            >
                                <SortableContext items={confirmRoute} strategy={horizontalListSortingStrategy}>
                                    {confirmRoute.map((id) => (
                                        <div key={id} className="relative">
                                            <SortableItem id={id} />
                                            <button
                                                type="button"
                                                onClick={() => setConfirmRoute(confirmRoute.filter((i) => i !== id))}
                                                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <div className="w-10 h-10 rounded-full border border-dashed border-yellow-500 flex items-center justify-center text-yellow-500">
                                +
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full px-4 pt-2 pb-1 bg-[#222834] border-b border-b-[#98A1B3]">
                        <input
                            type="text"
                            className="w-full bg-[#222834] text-[#F4F7FF] text-base focus:outline-none"
                            placeholder="Remarks (Optional)"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap pt-12 mt-auto  bottom ">
                        <button
                            type="submit"
                            className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04]"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setEditData(false)}
                            type="button"
                            className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </SlideOver>

            {deleteModal && (
                <div className="fixed w-screen h-screen flex justify-center items-center bg-[rgba(0,0,0,0.5)]">
                    <DeleteModal loading={loading} setModal={setDeleteModal} handleDelete={handleDelete} />
                </div>
            )}
        </MainLayout>
    );
};

export default RoutePage;

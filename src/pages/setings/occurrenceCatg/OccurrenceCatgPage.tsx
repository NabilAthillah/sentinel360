import { Switch } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import Navbar from "../../../components/Navbar";
import MainLayout from "../../../layouts/MainLayout";
import occurrenceCatgService from "../../../services/occurrenceCatgService";
import { RootState } from "../../../store";
import { OccurrenceCategory } from "../../../types/occurrenceCategory";
import auditTrialsService from "../../../services/auditTrailsService";

const OccurrenceCatgPage = () => {
    const [addCatg, setAddCatg] = useState(false);
    const [editCatg, setEditCatg] = useState(false);
    const [editData, setEditData] = useState<OccurrenceCategory | null>();
    const [sidebar, setSidebar] = useState(false);
    const [data1, setData1] = useState(true);
    const [data2, setData2] = useState(false);
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<OccurrenceCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState<OccurrenceCategory[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = (searchTerm ? filteredCategories : categories).slice(indexOfFirstItem, indexOfLastItem);

    const navigate = useNavigate();

    const [name, setName] = useState('');

    const totalItems = searchTerm ? filteredCategories.length : categories.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const user = useSelector((state: RootState) => state.user.user);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await occurrenceCatgService.getCategories(token);

            if (response.success) {
                setCategories(response.data.categories)
            }
        } catch (error: any) {
            console.error(error.message)
        }
    }

    const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
        categories?.reduce((acc, catg) => {
            acc[catg.id] = catg.status === 'active';
            return acc;
        }, {} as Record<string, boolean>) ?? {}
    );

    const handleToggle = async (id: string) => {
        const prevStatus = switchStates[id];
        const newStatus = !prevStatus;

        setSwitchStates((prev) => ({
            ...prev,
            [id]: newStatus,
        }));

        const token = localStorage.getItem('token');

        if (!token) {
            localStorage.clear();
            navigate('/login');
        }

        try {
            const response = await occurrenceCatgService.editCategoryStatus(token, id, newStatus ? 'active' : 'inactive');

            if (response.success) {
                toast.success('Category status updated successfully');
                fetchCategories();
            }
        } catch (error) {
            console.error();
            setSwitchStates((prev) => ({
                ...prev,
                [id]: prevStatus,
            }));

            toast.error('Failed to update category status');
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await occurrenceCatgService.addCategory(token, name);

            if (response.success) {
                toast.success('Category created successfully');

                fetchCategories();
                setLoading(false);
                setAddCatg(false);
                setName('');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const handleEdit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await occurrenceCatgService.editCategory(token, editData?.id, name);

            if (response.success) {
                toast.success('Category updated successfully');

                fetchCategories();
                setLoading(false);
                setEditData(null);
                setName('');
                setEditCatg(false);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const handleSearch = () => {
        const filtered = categories.filter((category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    };

    const hasPermission = (permissionName: string) => {
        return user?.role?.permissions?.some(p => p.name === permissionName);
    };

    const audit = async () => {
        try {
            const token = localStorage.getItem('token');
            const title = `Access occurrence catgories page`;
            const description = `User ${user?.email} access occurrence categories page`;
            const status = 'success';
            await auditTrialsService.storeAuditTrails(token, user?.id, title, description, status, 'access occurrence categories');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        audit();
        if (hasPermission('list_occurrence_categories')) {
            fetchCategories();
        } else {
            navigate('/dashboard');
        }
    }, []);

    useEffect(() => {
        if (categories) {
            const newSwitchStates = categories.reduce((acc, catg) => {
                acc[catg.id] = catg.status === 'active';
                return acc;
            }, {} as Record<string, boolean>);

            setSwitchStates(newSwitchStates);
        }
    }, [categories]);

    useEffect(() => {
        if (editData && editCatg) {
            setName(editData.name)
        }
    }, [editCatg])

    useEffect(() => {
        const filtered = categories.filter((category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [searchTerm, categories]);

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full flex-1'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Settings</h2>
                <div className="flex flex-col gap-8 w-full h-full flex-1">
                    <Navbar />
                    <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
                        <div className="w-full flex justify-between items-center gap-4 flex-wrap lg:flex-nowrap">
                            <div className="flex items-end gap-4 w-full">
                                <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                                    <input
                                        type={"text"}
                                        className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch();
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="p-2 rounded-[4px_4px_0px_0px]"
                                        tabIndex={-1}
                                        onClick={handleSearch}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                                    </button>
                                </div>
                            </div>
                            {hasPermission('add_occurrence_category') && (
                                <div className="w-[200px]">
                                    <button onClick={() => setAddCatg(true)} className="font-medium text-base min-w-[200px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add category</button>
                                </div>
                            )}
                        </div>
                        <div className="w-full h-full relative flex flex-1 pb-10">
                            <div className="w-full h-fit overflow-auto pb-5 flex-1">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr>
                                            <th className="font-semibold text-[#98A1B3] text-start">S/NO</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Category</th>
                                            <th className="font-semibold text-[#98A1B3] text-start flex items-center gap-2">Status</th>
                                            <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((category, index) => (
                                            <tr key={index}>
                                                <td className="text-[#F4F7FF] pt-6 pb-3">{indexOfFirstItem + index + 1}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">{category.name}</td>
                                                <td className="text-[#F4F7FF] pt-6 pb-3 ">
                                                    {hasPermission('edit_occurrence_category') ? (
                                                        <div className="flex items-center gap-4 w-40">
                                                            <Switch
                                                                id={`custom-switch-component-${category.id}`}
                                                                ripple={false}
                                                                checked={switchStates[category.id]}
                                                                onChange={(e) => handleToggle(category.id)}
                                                                className="h-full w-full checked:bg-[#446FC7]"
                                                                containerProps={{
                                                                    className: "w-11 h-6",
                                                                }}
                                                                circleProps={{
                                                                    className: "before:hidden left-0.5 border-none",
                                                                }} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
                                                            <p className={`font-medium text-sm capitalize ${switchStates[category.id] ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>
                                                                {switchStates[category.id] ? 'active' : 'inactive'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className={`font-medium text-sm capitalize ${switchStates[category.id] ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>
                                                            {switchStates[category.id] ? 'active' : 'inactive'}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="pt-6 pb-3">
                                                    <div className="flex gap-6 items-center justify-center">
                                                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14305"><rect x="0" y="0" width="28" height="28" rx="0"/></clipPath></defs><g><g clip-path="url(#master_svg0_247_14305)"><g><path d="M11.46283298828125,19.6719859375L16.76641298828125,19.6719859375C17.495712988281248,19.6719859375,18.09231298828125,19.0752859375,18.09231298828125,18.3460859375L18.09231298828125,11.7165359375L20.20051298828125,11.7165359375C21.38061298828125,11.7165359375,21.97721298828125,10.2845659375,21.14191298828125,9.449245937499999L15.05601298828125,3.3633379375C14.54009298828125,2.8463349375,13.70246298828125,2.8463349375,13.18651298828125,3.3633379375L7.1006129882812505,9.449245937499999C6.26529298828125,10.2845659375,6.84869298828125,11.7165359375,8.02874298828125,11.7165359375L10.136932988281249,11.7165359375L10.136932988281249,18.3460859375C10.136932988281249,19.0752859375,10.73359298828125,19.6719859375,11.46283298828125,19.6719859375ZM6.15921298828125,22.3237859375L22.07011298828125,22.3237859375C22.79931298828125,22.3237859375,23.39601298828125,22.9203859375,23.39601298828125,23.6496859375C23.39601298828125,24.3788859375,22.79931298828125,24.9755859375,22.07011298828125,24.9755859375L6.15921298828125,24.9755859375C5.42996998828125,24.9755859375,4.83331298828125,24.3788859375,4.83331298828125,23.6496859375C4.83331298828125,22.9203859375,5.42996998828125,22.3237859375,6.15921298828125,22.3237859375Z" fill="#F4F7FF" fill-opacity="1"/></g></g></g></svg> */}
                                                        {hasPermission('edit_occurrence_category') && (
                                                            <svg onClick={() => { setEditCatg(true); setEditData(category) }} className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg>
                                                        )}
                                                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                                <button
                                    className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">{currentPage}</button>
                                <button
                                    className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {editCatg && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <form onSubmit={handleEdit} className="flex flex-col gap-6 p-6 bg-[#252C38]">
                        <h2 className='text-2xl leading-[36px] text-white font-noto'>Edit Category</h2>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Category name</label>
                            <input
                                type={"text"}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder='Category name'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                            <button onClick={() => { setEditCatg(false); setEditData(null) }} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            {addCatg && (
                <div className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-[#252C38]">
                        <h2 className='text-2xl leading-[36px] text-white font-noto'>Add Category</h2>
                        <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                            <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Category name</label>
                            <input
                                type={"text"}
                                className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                placeholder='Category name'
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Submit'}</button>
                            <button onClick={() => setAddCatg(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </MainLayout>
    )
}

export default OccurrenceCatgPage;
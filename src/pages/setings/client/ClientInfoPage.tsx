import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/Navbar";
import MainLayout from "../../../layouts/MainLayout";
import clientInfoService from "../../../services/clientInfoService";
import { Client } from "../../../types/client";

const ClientInfoPage = () => {
    const navigate = useNavigate();

    const [client, setClient] = useState<Client>({
        id: '',
        name: '',
        reg_no: '',
        address: '',
        contact: '',
        website: '',
        email: '',
        logo: '',
        chart: '',
    });

    const [name, setName] = useState('');
    const [reg, setReg] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const chartInputRef = useRef<HTMLInputElement | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [chartName, setChartName] = useState<string | null>(null);
    const [chartFile, setChartFile] = useState<File | null>(null);
    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setClient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const fetchClientInfo = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await clientInfoService.getData(token);

            if (response.success) {
                setClient(response.data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        try {
            const toBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const chartBase64 = chartFile ? await toBase64(chartFile) : null;

            const payload = {
                name,
                reg_no: reg,
                address,
                contact,
                website,
                email,
                logo: imageBase64,
                chart: chartBase64,
            };

            const token = localStorage.getItem('token');

            if (!token) {
                localStorage.clear();
                navigate('/login');
            }

            const response = await clientInfoService.updateData(token, payload, client.id);

            if (response.success) {
                toast.success('Client Info Updated successfully');
                setName('');
                setReg('');
                setAddress('');
                setContact('');
                setWebsite('');
                setEmail('');
                setImageFile(null);
                setImageName('');
                setChartFile(null);
                setChartName('');

                fetchClientInfo();
            }
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchClientInfo();
    }, [])

    useEffect(() => {
        setName(client.name);
        setReg(client.reg_no);
        setAddress(client.address);
        setContact(client.contact);
        setWebsite(client.website);
        setEmail(client.email);
    }, [client])

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Settings</h2>
                <div className="flex flex-col gap-8 w-full h-full">
                    <Navbar />
                    <div className="flex gap-6 flex-wrap xl:flex-nowrap">
                        <div className="flex flex-col w-full gap-6 xl:max-w-80">
                            <div className="flex flex-col gap-4 bg-[#252C38] xl:max-w-80 w-full h-fit p-4 rounded-lg">
                                <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">{client.name}</p>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Reg. No</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">{client.reg_no}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Address</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">{client.address}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Contact</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">+65 {client.contact}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Website</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">{client.website}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Email</label>
                                    <p className="text-base leading-[20px] text-[#F4F7FF]">{client.email}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="" className="text-xs text-[#98A1B3]">Management chart</label>
                                    <div>
                                        <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${client.chart}`} onClick={() => setIsOpen(true)} />
                                        {isOpen && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                                                    <h2 className="text-xl font-semibold mb-4">Management Chart</h2>
                                                    <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="absolute top-4 right-4 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                                                    >
                                                        Close
                                                    </button>
                                                    <img
                                                        src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${client.chart}`}
                                                        alt="Management Chart"
                                                        className="mx-auto max-h-[400px] object-contain"
                                                    />

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* <div className="w-[80px] h-[52px] rounded-lg opacity-20 bg-[#D8D8D8]"></div> */}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 justify-between gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3">
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Sites</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">4</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Employees</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">12</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Asigned</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">10</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">Unasigned</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">1</p>
                                </div>
                                <div className="flex flex-col gap-2 px-4 py-[14px] w-full bg-[#252C38] shadow-[2px_2px_12px_rgba(24,29,38,0.14)] rounded-xl">
                                    <p className="font-open font-semibold text-sm leading-[20px] text-[#98A1B3]">On leave</p>
                                    <p className="font-open font-semibold text-2xl leading-[20px] text-[#F4F7FF]">1</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="w-full p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Company name</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Company name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Reg No.</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Reg No.'
                                        value={reg}
                                        onChange={(e) => setReg(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Adress with postal code</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Adress with postal code'
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Contact</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Contact'
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Website</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Website'
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                    <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                    <input
                                        type={"text"}
                                        className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                        placeholder='Email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">Site image <span className='text-xs'>(Max file size: 5MB)</span><span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span></label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                        >
                                            Upload file
                                        </button>
                                        {imageName && (
                                            <span className="text-sm text-[#98A1B3]">{imageName}</span>
                                        )}
                                    </div>
                                    {client.logo != '' && (
                                        <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${client.logo}`} alt="Image" className='h-14 w-fit' />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={imageInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            console.log("Selected image file:", file);
                                            if (file) {
                                                const maxSizeInBytes = 5 * 1024 * 1024;

                                                if (file.size > maxSizeInBytes) {
                                                    alert("Maximum image size is 5MB!");
                                                    e.target.value = "";
                                                    return;
                                                }

                                                setImageName(file.name);
                                                setImageFile(file)
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs leading-[21px] text-[#98A1B3]">Organisation chart <span className='text-xs'>(Max file size: 5MB)</span><span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span></label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => chartInputRef.current?.click()}
                                            className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                                        >
                                            Upload file
                                        </button>
                                        {chartName && (
                                            <span className="text-sm text-[#98A1B3]">{chartName}</span>
                                        )}
                                    </div>
                                    {client.chart != '' && (
                                        <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${client.chart}`} alt="Image" className='h-14 w-fit' />
                                    )}
                                    <input
                                        type="file"
                                        ref={chartInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            console.log("Selected image file:", file);
                                            if (file) {
                                                const maxSizeInBytes = 5 * 1024 * 1024;

                                                if (file.size > maxSizeInBytes) {
                                                    alert("Maximum image size is 5MB!");
                                                    e.target.value = "";
                                                    return;
                                                }

                                                setChartName(file.name);
                                                setChartFile(file)
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default ClientInfoPage;
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import { setUser } from "../../../features/user/userSlice";
import MainLayout from "../../../layouts/MainLayout";
import authService from "../../../services/authService";
import { RootState } from "../../../store";


const ProfilePage = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const baseURL = new URL(process.env.REACT_APP_API_URL || '');
    baseURL.pathname = baseURL.pathname.replace(/\/api$/, '');

    const [data, setData] = useState({
        name: user?.name,
        address: user?.address,
        mobile: user?.mobile,
        email: user?.email,
        old_password: '',
        new_password: '',

    });

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const toBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });

            const imageBase64 = imageFile ? await toBase64(imageFile) : null;
            const response = await authService.updateProfile(user?.id, token, data.name, data.address, data.mobile, data.email, data.old_password, data.new_password, imageBase64);

            if (response.success) {
                toast.success('Profile updated successfully');
                dispatch(setUser(response.data.user));
                setData({
                    name: response.data.user.name,
                    address: response.data.user.address,
                    mobile: response.data.user.mobile,
                    email: response.data.user.email,
                    old_password: '',
                    new_password: '',
                });
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainLayout>
            <div className='flex flex-col gap-4 px-6 pb-20 w-full h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Profile</h2>
                <div className="flex gap-6 flex-wrap lg:flex-nowrap">
                    <div className="flex flex-col w-full gap-6 lg:max-w-80">
                        <div className="flex flex-col gap-4 bg-[#252C38] lg:max-w-80 w-full h-fit p-4 rounded-lg">
                            <p className="font-semibold text-base leading-[20px] text-[#EFBF04]">{user && user.role ? user.role.name : '-'}</p>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="" className="text-xs text-[#98A1B3]">NRIC</label>
                                <p className="text-base leading-[20px] text-[#F4F7FF]">{user && user.employee ? user.employee.nric_fin_no : '-'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="" className="text-xs text-[#98A1B3]">Company</label>
                                <p className="text-base leading-[20px] text-[#F4F7FF]">Sentinel Group</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="" className="text-xs text-[#98A1B3]">Contact</label>
                                <p className="text-base leading-[20px] text-[#F4F7FF]">{user && user.mobile ? user.mobile : '-'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="" className="text-xs text-[#98A1B3]">Email</label>
                                <p className="text-base leading-[20px] text-[#F4F7FF]">{user && user.email ? user.email : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full p-6 h-full rounded-lg bg-[#252C38] flex flex-col gap-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Name'
                                    value={data && data.name ? data.name : ''}
                                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Address</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Address'
                                    value={data && data.address ? data.address : ''}
                                    onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Mobile</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Mobile'
                                    value={data && data.mobile ? data.mobile : ''}
                                    onChange={(e) => setData(prev => ({ ...prev, mobile: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Email</label>
                                <input
                                    type={"text"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='Email'
                                    value={data && data.email ? data.email : ''}
                                    onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            {/* <div className="flex flex-col gap-3">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Profile photo</label>
                                <button className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]">Upload file</button>
                            </div> */}
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Old password</label>
                                <input
                                    type={"password"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='****'
                                    onChange={(e) => setData(prev => ({ ...prev, old_password: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col max-w-[520px] w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">New password</label>
                                <input
                                    type={"password"}
                                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder='****'
                                    onChange={(e) => setData(prev => ({ ...prev, new_password: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs leading-[21px] text-[#98A1B3]">
                                Profile photo <span className='text-xs'>(Maximum image size is 5MB!)</span> <span className='text-red-500 text-[10px]'>* Do not upload if you don't want to make changes</span>
                            </label>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border border-[#EFBF04] rounded-full cursor-pointer hover:bg-[#EFBF04] hover:text-[#252C38]"
                                >
                                    Upload file
                                </button>

                                {imageName && (
                                    <span className="text-sm text-[#98A1B3]">{imageName}</span>
                                )}
                            </div>

                            {imageFile ? (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    className="h-14 w-auto rounded"
                                />
                            ) : user ? (
                                <img src={`${baseURL.toString() != '' ? baseURL.toString() : 'http://localhost:8000/'}storage/${user.profile_image}`} alt="Image" className='h-14 w-fit' />
                            ) : null}

                            <input
                                type="file"
                                accept="image/*"
                                ref={imageInputRef}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const maxSizeInBytes = 5 * 1024 * 1024;

                                        if (file.size > maxSizeInBytes) {
                                            toast.warning('Maximum file size is 5MB!');
                                            e.target.value = "";
                                            return;
                                        }

                                        setImageName(file.name);
                                        setImageFile(file);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            <button type="submit" className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">{loading ? <Loader /> : 'Save'}</button>
                            <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}

export default ProfilePage;
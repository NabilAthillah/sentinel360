import { AlignLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import { toast } from "react-toastify";

type User = {
    id: number;
    name: string;
    email: string;
    status: string;
    address: string;
    phone: string;
    profile_image: string;
    Role: {
        id: number;
        name: string;
    };
};


const Header = ({ openSidebar }: { openSidebar: any }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState<User>();
    const navigate = useNavigate();

    const handleLogout = async(e:React.SyntheticEvent) => {
        e.preventDefault();

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.success('Logout successfully');
        navigate('/login');
    }

    useEffect(() => {
        const checkAuth = async () => {
            const user = localStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : null;

            if (!parsedUser || !parsedUser.id) {
                localStorage.clear();
                navigate('/login');
                return;
            }

            try {
                const response = await userService.getUserById(parsedUser.id);
                if (response && response.data) {
                    setUser(response.data);
                    console.log(response.data)
                }
            } catch (error) {
                localStorage.clear();
                navigate('/login');
                return;
            }
        };

        checkAuth();
    }, []);

    return (
        <nav className='w-full bg-transparent p-6 flex items-center justify-between md:justify-end relative sm:gap-4'>
            <AlignLeft onClick={() => openSidebar(true)} color="#ffffff" className="cursor-pointer md:hidden" />
            <div className="flex items-center justify-end gap-1 relative sm:gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="40" height="40" viewBox="0 0 40 40"><defs><clipPath id="master_svg0_323_21322"><rect x="11" y="11" width="18" height="18" rx="0" /></clipPath></defs><g><g><g><g clip-path="url(#master_svg0_323_21322)"><g><path d="M16.567999839782715,26.75C16.858744839782716,27.418548,17.338421839782715,27.98762,17.948109839782713,28.38733C18.557809839782713,28.78703,19.270969839782715,28.99996,19.999999839782713,28.99996C20.729029839782715,28.99996,21.442189839782714,28.78703,22.051889839782714,28.38733C22.661579839782714,27.98762,23.141259839782716,27.418548,23.431999839782716,26.75C23.431999839782716,26.75,16.567999839782715,26.75,16.567999839782715,26.75Z" fill="#A5A5AB" fill-opacity="1" /></g><g><path d="M27.7940687789917,20.41176171875C27.7940687789917,20.41176171875,26.4920687789917,16.11951171875,26.4920687789917,16.11951171875C26.0750687789917,14.61827171875,25.1685687789917,13.29934171875,23.9164687789917,12.37213171875C22.664268778991698,11.44492971875,21.138298778991697,10.96259661875,19.5807287789917,11.00171692875C18.0231487789917,11.04083721875,16.5232887789917,11.59916871875,15.319268778991699,12.58806171875C14.115248778991699,13.57695171875,13.276098778991699,14.93973171875,12.9350387789917,16.46001171875C12.9350387789917,16.46001171875,11.924041778991699,20.61276171875,11.924041778991699,20.61276171875C11.789667278991699,21.164611718750002,11.7823866789917,21.73971171875,11.902749878991699,22.29471171875C12.023112778991699,22.84981171875,12.2679757789917,23.37021171875,12.618858778991699,23.81681171875C12.9697387789917,24.26341171875,13.417478778991699,24.62441171875,13.9282787789917,24.87271171875C14.4390787789917,25.121011718749997,14.9995987789917,25.250011718750002,15.567538778991699,25.250011718750002C15.567538778991699,25.250011718750002,24.2052687789917,25.250011718750002,24.2052687789917,25.250011718750002C24.7908687789917,25.250011718750002,25.3682687789917,25.11291171875,25.8912687789917,24.84971171875C26.4143687789917,24.58641171875,26.868468778991698,24.204411718750002,27.2172687789917,23.73411171875C27.5661687789917,23.26381171875,27.799968778991698,22.71831171875,27.9001687789917,22.14141171875C28.0002687789917,21.564511718749998,27.9639687789917,20.97211171875,27.7940687789917,20.41176171875C27.7940687789917,20.41176171875,27.7940687789917,20.41176171875,27.7940687789917,20.41176171875Z" fill="#A5A5AB" fill-opacity="1" /></g></g><g><rect x="21" y="0" width="19" height="18" rx="4" fill="#19CE74" fill-opacity="1" /><g><path d="M27.752841,12L27.752841,11.3608L30.15341,8.732949999999999Q30.57599,8.27131,30.849429999999998,7.92862Q31.12287,7.58594,31.25604,7.28232Q31.3892,6.97869,31.3892,6.64489Q31.3892,6.26136,31.206319999999998,5.98082Q31.02344,5.700279999999999,30.70739,5.54759Q30.39134,5.39489,29.99716,5.39489Q29.57812,5.39489,29.2674,5.56712Q28.95668,5.73935,28.788,6.0483Q28.619320000000002,6.35724,28.619320000000002,6.77273L27.78125,6.77273Q27.78125,6.13352,28.07599,5.65057Q28.37074,5.16761,28.88033,4.89773Q29.38991,4.62784,30.025570000000002,4.62784Q30.66477,4.62784,31.15838,4.89773Q31.651989999999998,5.16761,31.93253,5.62571Q32.21307,6.08381,32.21307,6.64489Q32.21307,7.04616,32.06925,7.42791Q31.92543,7.80966,31.57209,8.27663Q31.21875,8.74361,30.59375,9.41477L28.96023,11.16193L28.96023,11.21875L32.34091,11.21875L32.34091,12L27.752841,12Z" fill="#FFFFFF" fill-opacity="1" /></g></g></g></g></g></svg>
                <div className='flex items-center gap-1 cursor-pointer' onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="relative flex w-fit">
                        <div className="w-[14px] h-[14px] bg-[#22CAAD] border-2 border-[#07080B] rounded-full absolute bottom-[-2px] right-[-2px]"></div>
                        <img src={user?.profile_image ? user?.profile_image : "/images/profile.png"} alt="" className='profile' />
                    </div>
                    <div className='flex flex-col gap-[2px]'>
                        <p className="text-sm text-white">{user?.name}</p>
                        <p className="text-xs leading-[21px] text-[#A3A9B6]">{user?.Role.name}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_21343"><rect x="3" y="3" width="18" height="18" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_323_21343)"><g><path d="M7.810527065124512,9.75C7.810527065124512,9.75,16.189527065124512,9.75,16.189527065124512,9.75C16.33783706512451,9.7500316682,16.48281706512451,9.7940353,16.60611706512451,9.876448C16.72942706512451,9.958862,16.82553706512451,10.075984,16.882287065124512,10.213009C16.93903706512451,10.350033,16.953887065124512,10.500807,16.924967065124513,10.646272C16.89603706512451,10.79174,16.824637065124513,10.92536,16.71977706512451,11.03025C16.71977706512451,11.03025,12.530277065124512,15.21974,12.530277065124512,15.21974C12.389627065124511,15.36034,12.198897065124513,15.43933,12.000027065124511,15.43933C11.801157065124512,15.43933,11.610427065124512,15.36034,11.46977706512451,15.21974C11.46977706512451,15.21974,7.280277065124512,11.03025,7.280277065124512,11.03025C7.175420065124512,10.92536,7.104015265124512,10.79174,7.075089665124512,10.646272C7.046163965124512,10.500807,7.061016407124511,10.350033,7.117768965124512,10.213009C7.1745210651245115,10.075984,7.270626065124512,9.958862,7.393933065124512,9.876448C7.517241065124511,9.7940353,7.662215065124512,9.7500316682,7.810527065124512,9.75Z" fill="#A3A9B6" fill-opacity="1" /></g></g></g></svg>
                    {dropdownOpen && (
                        <div className="px-6 py-4 bg-[#252C38] rounded-lg flex flex-col gap-4 absolute bottom-[-138px] right-[8px] transition-all">
                            <Link to='/settings/profile' className="text-[#F4F7FF] hover:underline">Profile</Link>
                            <Link to='/settings/attendance' className="text-[#F4F7FF] hover:underline">Master Settings</Link>
                            <p onClick={handleLogout} className="text-[#F4F7FF] hover:underline">Logout</p>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Header
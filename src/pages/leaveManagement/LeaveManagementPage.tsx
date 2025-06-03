import { useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { SwitchCustomStyleToggleable } from "../../components/SwitchCustomStyleToggleable";

const LeaveManagementPage = () => {
    const [sidebar, setSidebar] = useState(false);
    const [add, setAdd] = useState(true);

    return (
        <main className='max-w-screen w-full min-h-screen bg-[#181D26]'>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />
            <Sidebar isOpen={sidebar} closeSidebar={setSidebar} />
            <div className='flex flex-col max-w-screen w-full pl-0 h-screen transition-all duration-200 md:pl-[265px]'>
                <Header openSidebar={setSidebar} />
                <div className='flex flex-col gap-6 px-6 pb-6 w-full h-full'>
                    <h2 className='text-2xl leading-9 text-white font-noto'>Leave management</h2>
                    <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full">
                        <div className="w-full flex flex-col gap-4 flex-wrap">
                            <div className="flex items-end justify-between gap-4 w-full flex-wrap md:flex-nowrap">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_247_12873"><rect x="0" y="0" width="32" height="32" rx="0" /></clipPath></defs><g clip-path="url(#master_svg0_247_12873)"><g><path d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z" fill="#98A1B3" fill-opacity="1" /></g></g></svg>
                                    </button>
                                </div>
                                <div className="min-w-[180px] max-w-[200px] w-fit">
                                    <button onClick={() => setAdd(true)} className="font-medium text-base text-[#181d26] px-7 py-[13.5px] border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all">Add leave type</button>
                                </div>
                            </div>
                            <div className="flex items-end gap-4 w-full flex-wrap xl:grid xl:grid-cols-4">
                                <input
                                    type={"text"}
                                    className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="All sites"
                                />
                                <input
                                    type={"text"}
                                    className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="All employees"
                                />
                                <input
                                    type={"text"}
                                    className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="All status"
                                />
                                <input
                                    type={"text"}
                                    className="max-w-[400px] w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] border-b-[1px] border-b-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none"
                                    placeholder="Date range"
                                />
                            </div>
                        </div>
                        <div className="w-full h-full relative">
                            <div className="w-full h-fit overflow-auto pb-5">
                                <table className="min-w-[800px] w-full">
                                    <thead>
                                        <tr>
                                            <th className="font-semibold text-[#98A1B3] text-start">S. no</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Name</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Type</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">From</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">To</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Total</th>
                                            <th className="font-semibold text-[#98A1B3] text-start">Date submitted</th>
                                            <th className="font-semibold text-[#98A1B3] text-center">Status</th>
                                            <th className="font-semibold text-[#98A1B3] text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">1</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Selvan</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Sick</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">10/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">11/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">2 days</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">9/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 flex justify-center">
                                                <div className="px-6 py-2 border-[1px] border-[#19CE74] text-[#19CE74] font-medium text-sm bg-[rgba(25,206,116,0.16)] rounded-full w-fit">
                                                    Approved
                                                </div>
                                            </td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="20" viewBox="0 0 20 20"><g><path d="M10,0C4.47,0,0,4.47,0,10C0,15.53,4.47,20,10,20C15.53,20,20,15.53,20,10C20,4.47,15.53,0,10,0ZM15,13.59L13.59,15L10,11.41L6.41,15L5,13.59L8.59,10L5,6.41L6.41,5L10,8.59L13.59,5L15,6.41L11.41,10L15,13.59Z" fill="#98A1B3" fill-opacity="1" /></g></svg>
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_353_12259"><rect x="28" y="28" width="28" height="28" rx="0"/></clipPath></defs><g transform="matrix(-1,-5.2146120310681e-8,5.2146120310681e-8,-1,55.99999853990863,56.00000146009137)"><g clip-path="url(#master_svg0_353_12259)"><g><path d="M39.46283298828125,47.6719859375L44.766412988281246,47.6719859375C45.49571298828125,47.6719859375,46.09231298828125,47.0752859375,46.09231298828125,46.3460859375L46.09231298828125,39.7165359375L48.20051298828125,39.7165359375C49.38061298828125,39.7165359375,49.97721298828125,38.2845659375,49.14191298828125,37.4492459375L43.05601298828125,31.3633379375C42.54009298828125,30.8463349375,41.70246298828125,30.8463349375,41.18651298828125,31.3633379375L35.10061298828125,37.4492459375C34.26529298828125,38.2845659375,34.84869298828125,39.7165359375,36.02874298828125,39.7165359375L38.13693298828125,39.7165359375L38.13693298828125,46.3460859375C38.13693298828125,47.0752859375,38.73359298828125,47.6719859375,39.46283298828125,47.6719859375ZM34.15921298828125,50.3237859375L50.07011298828125,50.3237859375C50.79931298828125,50.3237859375,51.39601298828125,50.9203859375,51.39601298828125,51.649685937499996C51.39601298828125,52.3788859375,50.79931298828125,52.9755859375,50.07011298828125,52.9755859375L34.15921298828125,52.9755859375C33.42996998828125,52.9755859375,32.83331298828125,52.3788859375,32.83331298828125,51.649685937499996C32.83331298828125,50.9203859375,33.42996998828125,50.3237859375,34.15921298828125,50.3237859375Z" fill="#F4F7FF" fill-opacity="1"/></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">2</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Michale</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Annual</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">10/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">11/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">2 days</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">9/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 flex justify-center">
                                                <div className="px-6 py-2 border-[1px] border-[#FFAC38] text-[#FFAC38] font-medium text-sm bg-[rgba(255,172,56,0.16)] rounded-full w-fit">
                                                    Pending
                                                </div>
                                            </td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="20" viewBox="0 0 20 20"><g><path d="M10,0C4.47,0,0,4.47,0,10C0,15.53,4.47,20,10,20C15.53,20,20,15.53,20,10C20,4.47,15.53,0,10,0ZM15,13.59L13.59,15L10,11.41L6.41,15L5,13.59L8.59,10L5,6.41L6.41,5L10,8.59L13.59,5L15,6.41L11.41,10L15,13.59Z" fill="#98A1B3" fill-opacity="1" /></g></svg>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20.999998092651367" height="21" viewBox="0 0 20.999998092651367 21"><g><path d="M10.5,0C4.704,0,0,4.704,0,10.5C0,16.296,4.704,21,10.5,21C16.296,21,21,16.296,21,10.5C21,4.704,16.296,0,10.5,0ZM10.5,18.9C5.8695,18.9,2.1,15.1305,2.1,10.5C2.1,5.8695,5.8695,2.1,10.5,2.1C15.1305,2.1,18.9,5.8695,18.9,10.5C18.9,15.1305,15.1305,18.9,10.5,18.9ZM15.3195,5.859L8.4,12.7785L5.6805,10.0695L4.2,11.55L8.4,15.75L16.8,7.35L15.3195,5.859Z" fill="#19CE74" fill-opacity="1" /></g></svg>
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_353_12259"><rect x="28" y="28" width="28" height="28" rx="0"/></clipPath></defs><g transform="matrix(-1,-5.2146120310681e-8,5.2146120310681e-8,-1,55.99999853990863,56.00000146009137)"><g clip-path="url(#master_svg0_353_12259)"><g><path d="M39.46283298828125,47.6719859375L44.766412988281246,47.6719859375C45.49571298828125,47.6719859375,46.09231298828125,47.0752859375,46.09231298828125,46.3460859375L46.09231298828125,39.7165359375L48.20051298828125,39.7165359375C49.38061298828125,39.7165359375,49.97721298828125,38.2845659375,49.14191298828125,37.4492459375L43.05601298828125,31.3633379375C42.54009298828125,30.8463349375,41.70246298828125,30.8463349375,41.18651298828125,31.3633379375L35.10061298828125,37.4492459375C34.26529298828125,38.2845659375,34.84869298828125,39.7165359375,36.02874298828125,39.7165359375L38.13693298828125,39.7165359375L38.13693298828125,46.3460859375C38.13693298828125,47.0752859375,38.73359298828125,47.6719859375,39.46283298828125,47.6719859375ZM34.15921298828125,50.3237859375L50.07011298828125,50.3237859375C50.79931298828125,50.3237859375,51.39601298828125,50.9203859375,51.39601298828125,51.649685937499996C51.39601298828125,52.3788859375,50.79931298828125,52.9755859375,50.07011298828125,52.9755859375L34.15921298828125,52.9755859375C33.42996998828125,52.9755859375,32.83331298828125,52.3788859375,32.83331298828125,51.649685937499996C32.83331298828125,50.9203859375,33.42996998828125,50.3237859375,34.15921298828125,50.3237859375Z" fill="#F4F7FF" fill-opacity="1"/></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-[#F4F7FF] pt-6 pb-3">3</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Selvan</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">Sick</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">10/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">11/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">2 days</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 ">9/05/2025</td>
                                            <td className="text-[#F4F7FF] pt-6 pb-3 flex justify-center">
                                                <div className="px-6 py-2 border-[1px] border-[#FF7E6A] text-[#FF7E6A] font-medium text-sm bg-[rgba(255,126,106,0.16)] rounded-full w-fit">
                                                    Approved
                                                </div>
                                            </td>
                                            <td className="pt-6 pb-3">
                                                <div className="flex gap-6 items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20.999998092651367" height="21" viewBox="0 0 20.999998092651367 21"><g><path d="M10.5,0C4.704,0,0,4.704,0,10.5C0,16.296,4.704,21,10.5,21C16.296,21,21,16.296,21,10.5C21,4.704,16.296,0,10.5,0ZM10.5,18.9C5.8695,18.9,2.1,15.1305,2.1,10.5C2.1,5.8695,5.8695,2.1,10.5,2.1C15.1305,2.1,18.9,5.8695,18.9,10.5C18.9,15.1305,15.1305,18.9,10.5,18.9ZM15.3195,5.859L8.4,12.7785L5.6805,10.0695L4.2,11.55L8.4,15.75L16.8,7.35L15.3195,5.859Z" fill="#19CE74" fill-opacity="1" /></g></svg>
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_353_12259"><rect x="28" y="28" width="28" height="28" rx="0"/></clipPath></defs><g transform="matrix(-1,-5.2146120310681e-8,5.2146120310681e-8,-1,55.99999853990863,56.00000146009137)"><g clip-path="url(#master_svg0_353_12259)"><g><path d="M39.46283298828125,47.6719859375L44.766412988281246,47.6719859375C45.49571298828125,47.6719859375,46.09231298828125,47.0752859375,46.09231298828125,46.3460859375L46.09231298828125,39.7165359375L48.20051298828125,39.7165359375C49.38061298828125,39.7165359375,49.97721298828125,38.2845659375,49.14191298828125,37.4492459375L43.05601298828125,31.3633379375C42.54009298828125,30.8463349375,41.70246298828125,30.8463349375,41.18651298828125,31.3633379375L35.10061298828125,37.4492459375C34.26529298828125,38.2845659375,34.84869298828125,39.7165359375,36.02874298828125,39.7165359375L38.13693298828125,39.7165359375L38.13693298828125,46.3460859375C38.13693298828125,47.0752859375,38.73359298828125,47.6719859375,39.46283298828125,47.6719859375ZM34.15921298828125,50.3237859375L50.07011298828125,50.3237859375C50.79931298828125,50.3237859375,51.39601298828125,50.9203859375,51.39601298828125,51.649685937499996C51.39601298828125,52.3788859375,50.79931298828125,52.9755859375,50.07011298828125,52.9755859375L34.15921298828125,52.9755859375C33.42996998828125,52.9755859375,32.83331298828125,52.3788859375,32.83331298828125,51.649685937499996C32.83331298828125,50.9203859375,33.42996998828125,50.3237859375,34.15921298828125,50.3237859375Z" fill="#F4F7FF" fill-opacity="1"/></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14308"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14308)"><g><path d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clip-path="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fill-opacity="1" /></g></g></g></svg> */}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-3 w-[162px] absolute bottom-0 right-0">
                                <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F]">Prev</button>
                                <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">1</button>
                                <button className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F]">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                add && (
                    <div className="fixed w-screen h-screen flex justify-end items-start top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-6 p-6 bg-[#252C38] max-w-[568px] w-full max-h-screen overflow-auto h-full">
                            <div className="flex justify-between items-center">
                                <h2 className='text-2xl leading-[36px] text-white font-noto'>Add leave type</h2>
                                <button className="font-medium text-sm min-w-[142px] text-[#EFBF04] px-4 py-[9.5px] border-[1px] border-[#EFBF04] rounded-full hover:bg-[#EFBF04] hover:text-[#252C38] transition-all">Add another</button>
                            </div>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <select name="" id="" className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none">
                                    <option value="">Annual</option>
                                    <option value="">Sick</option>
                                    <option value="">Hospitalization</option>
                                    <option value="">Compassion</option>
                                    <option value="">Add new type</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <SwitchCustomStyleToggleable />
                                <p className={`font-medium text-sm text-[#19CE74]`}>Active</p>
                            </div>
                            <button className="w-fit font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Delete</button>
                            <h2 className='text-2xl leading-[36px] text-white font-noto'>Add another</h2>
                            <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b-[1px] border-b-[#98A1B3]">
                                <label htmlFor="" className="text-xs leading-[21px] text-[#98A1B3]">Name</label>
                                <select name="" id="" className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] placeholder:text-base active:outline-none focus-visible:outline-none">
                                    <option value="">Annual</option>
                                    <option value="">Sick</option>
                                    <option value="">Hospitalization</option>
                                    <option value="">Compassion</option>
                                    <option value="">Add new type</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <SwitchCustomStyleToggleable />
                                <p className={`font-medium text-sm text-[#19CE74]`}>Active</p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => { setAdd(false); toast.success('Leave type added successfully') }} className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]">Save</button>
                                <button onClick={() => setAdd(false)} className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </main>
    )
}

export default LeaveManagementPage
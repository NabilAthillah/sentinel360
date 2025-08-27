import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const SidebarLayout = ({ isOpen, closeSidebar }: { isOpen: boolean; closeSidebar: any }) => {
    const location = useLocation();
    const { pathname } = location;
    const { t } = useTranslation();

    return (
        // <AnimatePresence>
        //     {isOpen && (
        //         <motion.aside
        //             initial={{ x: "-100%" }}
        //             animate={{ x: 0 }}
        //             exit={{ x: "-100%" }}
        //             transition={{ duration: 0.3, ease: "easeInOut" }}
        //             className="max-w-[156px] w-full h-screen fixed top-0 left-0 bg-[#181D26] z-50 2xl:flex flex-col justify-between hidden"
        //         >
        //             <div className="flex flex-col items-center py-6 relative">
        //                 <img src="/images/logo.png" alt="Logo" className="w-[92px]" />
        //                 <X
        //                     onClick={() => closeSidebar(false)}
        //                     color='#ffffff'
        //                     className='absolute right-4 top-4 block md:hidden cursor-pointer'
        //                 />
        //             </div>

        //             <div className="w-full flex flex-col items-center pb-20">
        //                 <Link
        //                     to="/dashboard"
        //                     className="text-[#F1C40F] font-inter max-w-[74px] text-center text-sm hover:underline"
        //                 >
        //                     {t("Back to Dashboard")}
        //                 </Link>
        //             </div>
        //         </motion.aside>
        //     )}
        // </AnimatePresence>

        <aside
            className={`sm:max-w-[156px] w-full h-screen fixed flex flex-col justify-between top-0 bg-[#181D26] transition-all duration-200 z-50
  ${isOpen ? 'left-0' : '-left-full'} md:left-0`}
        >


            <Link to='/dashboard' className='w-full px-5 py-6 flex justify-between'>
                <img src="/images/logo.png" alt="" className='w-[126px] ' />
                <X onClick={() => closeSidebar(false)} color='#ffffff' className='block md:hidden' />
            </Link>

            <div className="w-full flex flex-col items-center pb-20">
                <Link
                    to="/dashboard"
                    className="text-[#F1C40F] font-inter max-w-[74px] text-center text-sm hover:underline"
                >
                    {t("Back to Dashboard")}
                </Link>
            </div>
        </aside>
    );
};

export default SidebarLayout;

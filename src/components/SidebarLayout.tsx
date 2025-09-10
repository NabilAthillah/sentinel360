import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const SidebarLayout = ({
  isOpen,
  closeSidebar,
  backBtn = true,
}: {
  isOpen: boolean;
  closeSidebar: any;
  backBtn?: boolean;
}) => {
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="max-w-[156px] w-full h-screen fixed top-0 left-0 bg-[#181D26] z-50 xl:flex flex-col justify-between hidden"
        >
          {/* Logo + Close button */}
          <div className="flex flex-col items-center py-6 relative">
            <Link
              to="/dashboard"
              className="text-[#F1C40F] font-inter max-w-[74px] text-center text-sm hover:underline"
            >
              <img src="/images/logo.png" alt="Logo" className="w-[92px]" />
            </Link>
          </div>

          {backBtn && (
            <div className="w-full flex flex-col items-center pb-20">
              <Link
                to="/dashboard"
                className="text-[#F1C40F] font-inter max-w-[74px] text-center text-sm hover:underline"
              >
                {t("Back to Dashboard")}
              </Link>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SidebarLayout;

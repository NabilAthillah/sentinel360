import React, { useCallback, useState } from "react";
import {
  User, Key, ScanLine, Info, LogOut, ChevronRight,
} from "lucide-react";
import BottomNavBar from "../components/BottomBar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "../../../features/user/userSlice";

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      dispatch(clearUser());

      navigate("/auth/login", { replace: true });
  }, [loggingOut, navigate]);

  const menuItems = [
    { icon: <User size={18} />, label: "Profile", path: "profile", isLogout: false },
    { icon: <Key size={18} />, label: "Change Password", path: "change-password", isLogout: false },
    { icon: <LogOut size={18} />, label: loggingOut ? "Logging out..." : "Logout", isLogout: true },
  ];

  return (
    <div className="min-h-screen bg-[#181D26] text-white p-4 flex flex-col pt-40 gap-3">
      {menuItems.map((item, index) =>
        item.isLogout ? (
          <button
            key={index}
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-between p-1 rounded-md hover:bg-[#222630] transition py-3 w-full text-left"
          >
            <div className="flex items-center gap-3 opacity-100">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        ) : (
          <Link
            to={item.path!}
            key={index}
            className="flex items-center justify-between p-1 rounded-md hover:bg-[#222630] transition py-3"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        )
      )}
      <BottomNavBar />
    </div>
  );
};

export default Settings;

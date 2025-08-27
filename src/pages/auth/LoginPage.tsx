import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";
import { setToken } from "../../features/user/tokenSlice";
import { setUser } from "../../features/user/userSlice";
import authService from "../../services/authService";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({
    account: "",
    password: "",
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  // Check token saat halaman dimuat
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await authService.checkToken();
        if (response.success) {
          const user = response.data.user || response.user; // sesuaikan struktur API
          if (user.role.name === "Administrator") {
            navigate("/dashboard");
          } else {
            navigate("/user");
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth/login");
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login");
      }
    };

    checkToken();
  }, [navigate]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!loginData.account) {
        toast.error("Email / Account Number is required!");
        setLoading(false);
        return;
      }
      if (!loginData.password) {
        toast.error("Password is required!");
        setLoading(false);
        return;
      }

      const response = await authService.login(loginData);
      if (response.success) {
        const user = response.user;
        const token = response.token;

        if (!user || !token) {
          toast.error("Login failed: invalid response from server.");
          setLoading(false);
          return;
        }

        if (user.role.name != 'SO' && user.role.name != 'SSO' && user.role.name != 'Administrator') {
          console.log(user.role.name)
          toast.error("Forbidden.");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch(setUser(user));
        dispatch(setToken(token));

        toast.success("Login successful!");

        if (user.role.name === "Administrator") {
          navigate("/dashboard");
        } else {
          navigate("/user");
        }
      } else {
        toast.error(response.message || "Login failed!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen w-full h-screen bg-[#181D26] flex flex-col justify-center items-center gap-20 px-5 sm:px-0">
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

      {/* Logo */}
      <img src="/images/logo.png" alt="App Logo" className="max-w-60 w-full" />

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="max-w-[400px] w-full flex flex-col gap-6"
      >
        <input
          type="text"
          placeholder="Email or Account Number"
          className="w-full px-4 pt-[17.5px] pb-[10.5px] text-[#F4F7FF] text-base bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px] placeholder:text-[#98A1B3] placeholder:text-base"
          required
          onChange={(e) =>
            setLoginData({ ...loginData, account: e.target.value })
          }
        />

        <div className="w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]"
            required
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={togglePassword}
            className="p-2 rounded-[4px_4px_0px_0px]"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff
                size={20}
                color="#98A1B3"
                style={{ backgroundColor: "#222834", borderRadius: "4px" }}
              />
            ) : (
              <Eye
                size={20}
                color="#98A1B3"
                style={{ backgroundColor: "#222834", borderRadius: "4px" }}
              />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-4 text-center text-[#181D26] font-medium bg-[#EFBF04] border-[1px] border-[#EFBF04] rounded-full transition-all hover:text-[#EFBF04] hover:bg-[#181D26] ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {loading ? <Loader primary /> : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

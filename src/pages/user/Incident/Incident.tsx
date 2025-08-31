import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Site } from "../../../types/site";
import siteService from "../../../services/siteService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { clearUser } from "../../../features/user/userSlice";

const Incident = () => {
  const navigate = useNavigate();
  const { idSite } = useParams<{ idSite: string }>();
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const [site, setSite] = useState<Site>();

  const fetchSite = async () => {
    const token = localStorage.getItem("token");
    if (!token || !idSite) {
      localStorage.removeItem("token");
      dispatch(clearUser());
      navigate("/auth/login")
    };
    try {
      const res = await siteService.getSiteById(idSite, token);
      if (res?.success) {
        const s = res.data?.site ?? res.data;
        setSite(s);
      }
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };

  const baseURL = new URL(process.env.REACT_APP_API_URL || "");
  baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");
  useEffect(() => {
    fetchSite();
  },[])
  return (
    <div className="min-h-screen bg-[#181D26] text-white flex flex-col pt-20">
      <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
        <ChevronLeft
          size={20}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">
          Incident
        </h1>
      </div>
      <div className="flex flex-col flex-1 justify-center items-center w-full">
        <img src={site?.image ? `${baseURL}storage/${site?.image}` : "/images/Incident.png"} alt="" className="w-1/2 " />
        <p className="text-[#F4F7FF] text-base font-medium">{site?.name}</p>
        <p className="text-[#98A1B3] text-sm font-normal">{site?.address}, {site?.postal_code}</p>
      </div>

      <div className="flex flex-col gap-4 justify-center items-center px-6 w-full py-10">
        <Link
          to="/user/incident/history"
          className="gap-3 w-full border py-3 border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center"
        >
          <p>History</p>
        </Link>

        <Link
          to={`/user/incident/${idSite}/report`}
          className="gap-3 w-full py-3  bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center"
        >
          <p>Report</p>
        </Link>
      </div>
    </div>
  );
};

export default Incident;

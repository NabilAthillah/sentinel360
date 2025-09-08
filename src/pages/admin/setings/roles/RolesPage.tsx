import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader";
import Navbar from "../../../../components/Navbar";
import MainLayout from "../../../../layouts/MainLayout";
import auditTrialsService from "../../../../services/auditTrailsService";
import permissionService from "../../../../services/permissionService";
import roleService from "../../../../services/roleService";
import { RootState } from "../../../../store";
import SecondLayout from "../../../../layouts/SecondLayout";
import SidebarLayout from "../../../../components/SidebarLayout";
import DeleteModal from "../../../../components/DeleteModal";
type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};

type Permission = {
  id: string;
  name: string;
  category: string;
};

type PermissionGroup = {
  [category: string]: Permission[];
};

const RolesPage = () => {
  const { t, i18n } = useTranslation();
  const [addRole, setAddRole] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [permissions, setPermissions] = useState<PermissionGroup>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editedRole, setEditedRole] = useState<Role>();
  const permissionsFlat = Object.values(permissions).flat();
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (searchTerm ? filteredRoles : roles).slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const totalItems = searchTerm ? filteredRoles.length : roles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.token.token);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleEditPermission = (id: string) => {
    if (!editedRole) return;

    const updatedPermissions = editedRole.permissions.some((p) => p.id === id)
      ? editedRole.permissions.filter((p) => p.id !== id)
      : [...editedRole.permissions, permissionsFlat.find((p) => p.id === id)!];

    setEditedRole({ ...editedRole, permissions: updatedPermissions });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!token) {
      navigate('/auth/login');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Pilih minimal 1 permission");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        permissions: selectedPermissions,
      };
      const response = await roleService.addRole(payload);
      if (response.success) toast.success("Role added successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSelectedPermissions([]);
      fetchRoles();
      setLoading(false);
      setAddRole(false);
    }
  };

  const handleEditRole = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!token) {
      navigate('/auth/login');
      return;
    }

    if (!editedRole || editedRole.permissions.length === 0) {
      toast.error("Pilih minimal 1 permission");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: editedRole.name,
        permissions: editedRole.permissions.map((p) => p.id),
      };
      const response = await roleService.updateRole(editedRole.id, payload);
      if (response.success) {
        toast.success("Role edited successfully");
        fetchRoles();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setEditRole(false);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    if (!token) {
      navigate('/auth/login');
      return;
    }
    try {
      const response = await roleService.getAllRoles(token);
      if (response.success) setRoles(response.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {

    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await permissionService.getAllPermissions();

      if (response.success) {
        setPermissions(response.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSearch = () => {
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  };

  const hasPermission = (permissionName: string) => {
    return user?.role?.permissions?.some((p) => p.name === permissionName);
  };

  const audit = async () => {
    try {
      const title = `Access roles page`;
      const description = `User ${user?.email} access roles page`;
      const status = "success";
      await auditTrialsService.storeAuditTrails(
        token,
        user?.id,
        title,
        description,
        status,
        "access roles"
      );
    } catch (error) {
      console.error(error);
    }
  };

  const formatPermissionName = (name: string) =>
    name
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/(^|\s)\S/g, (m) => m.toUpperCase());

  useEffect(() => {
    audit();
    if (hasPermission("list_roles")) {
      fetchRoles();
      fetchPermissions();
    } else {
      navigate("/dashboard");
    }
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    if (!token) {
      navigate('/auth/login');
      return;
    }
    try {
      if (!selectedId) {
        toast.error("No selected ID");
        return;
      }
      const response = await roleService.deleterole(selectedId);
      if (response.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
        setDeleteModal(false);
        setSelectedId(null);
      } else {
        toast.error("Failed to delete role");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting role");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  useEffect(() => {
    const anyOpen = addRole || editRole;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [addRole, editRole,]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddRole(false);
        setEditRole(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SecondLayout>
      <SidebarLayout isOpen={sidebar} closeSidebar={setSidebar} />
      <div className="flex flex-col gap-4 px-6 pb-20 w-full h-full flex-1">
        <h2 className="text-2xl leading-9 text-white font-noto">
          {t("Settings")}
        </h2>
        <div className="flex flex-col gap-8 w-full h-full flex-1">
          <Navbar />
          <div className="flex flex-col gap-10 bg-[#252C38] p-6 rounded-lg w-full h-full flex-1">
            <div className="w-full flex justify-between items-center gap-4 flex-wrap lg:flex-nowrap">
              <div className="max-w-[400px] w-full flex items-center bg-[#222834] border-b-[1px] border-b-[#98A1B3] rounded-[4px_4px_0px_0px]">
                <input
                  type={"text"}
                  className="w-full px-4 pt-[17.5px] pb-[10.5px] bg-[#222834] rounded-[4px_4px_0px_0px] text-[#F4F7FF] text-base placeholder:text-[#98A1B3]  placeholder:text-base active:outline-none focus-visible:outline-none"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button
                  type="button"
                  className="p-2 rounded-[4px_4px_0px_0px]"
                  tabIndex={-1}
                  onClick={handleSearch}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    version="1.1"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <defs>
                      <clipPath id="master_svg0_247_12873">
                        <rect x="0" y="0" width="32" height="32" rx="0" />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#master_svg0_247_12873)">
                      <g>
                        <path
                          d="M20.666698807907103,18.666700953674315L19.613298807907107,18.666700953674315L19.239998807907106,18.306700953674316C20.591798807907104,16.738700953674318,21.334798807907106,14.736900953674317,21.333298807907106,12.666670953674316C21.333298807907106,7.880200953674317,17.453098807907104,4.000000953674316,12.666668807907104,4.000000953674316C7.880198807907105,4.000000953674316,4.000000715257104,7.880200953674317,4.000000715257104,12.666670953674316C4.000000715257104,17.453100953674316,7.880198807907105,21.333300953674318,12.666668807907104,21.333300953674318C14.813298807907104,21.333300953674318,16.786698807907104,20.546700953674318,18.306698807907104,19.24000095367432L18.666698807907103,19.61330095367432L18.666698807907103,20.666700953674315L25.333298807907106,27.320000953674317L27.319998807907105,25.333300953674318L20.666698807907103,18.666700953674315ZM12.666668807907104,18.666700953674315C9.346668807907104,18.666700953674315,6.666668807907104,15.986700953674317,6.666668807907104,12.666670953674316C6.666668807907104,9.346670953674316,9.346668807907104,6.666670953674316,12.666668807907104,6.666670953674316C15.986698807907105,6.666670953674316,18.666698807907103,9.346670953674316,18.666698807907103,12.666670953674316C18.666698807907103,15.986700953674317,15.986698807907105,18.666700953674315,12.666668807907104,18.666700953674315Z"
                          fill="#98A1B3"
                          fillOpacity="1"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
              {hasPermission("add_role") && (
                <div className="w-[200px]">
                  <button
                    onClick={() => setAddRole(true)}
                    className="font-medium text-base min-w-[200px] text-[#181d26] px-[46.5px] py-3 border-[1px] border-[#EFBF04] bg-[#EFBF04] rounded-full hover:bg-[#181d26] hover:text-[#EFBF04] transition-all"
                  >
                    {t("Add role")}
                  </button>
                </div>
              )}
            </div>
            <div className="w-full h-full relative pb-10 flex flex-1">
              <div className="w-full h-full overflow-auto pb-5 flex flex-1">
                <table className="min-w-[700px] w-full">
                  <thead>
                    <tr>
                      <th className="font-semibold text-[#98A1B3] text-start">
                        {t("S/NO")}
                      </th>
                      <th className="font-semibold text-[#98A1B3] text-start">
                        {t("Role")}
                      </th>
                      <th className="font-semibold text-[#98A1B3] text-center">
                        {t("Actions")}
                      </th>
                    </tr>
                  </thead>
                  {loading ? (
                    <tbody>
                      <tr>
                        <td colSpan={4} className="py-10">
                          <div className="w-full flex justify-center">
                            <Loader primary />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentItems.map((data, index) => (
                        <tr>
                          <td className="text-[#F4F7FF] pt-6 pb-3">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="text-[#F4F7FF] pt-6 pb-3 ">
                            {data.name}
                          </td>
                          <td className="pt-6 pb-3">
                            <div className="flex gap-6 items-center justify-center">
                              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14305"><rect x="0" y="0" width="28" height="28" rx="0"/></clipPath></defs><g><g clipPath="url(#master_svg0_247_14305)"><g><path d="M11.46283298828125,19.6719859375L16.76641298828125,19.6719859375C17.495712988281248,19.6719859375,18.09231298828125,19.0752859375,18.09231298828125,18.3460859375L18.09231298828125,11.7165359375L20.20051298828125,11.7165359375C21.38061298828125,11.7165359375,21.97721298828125,10.2845659375,21.14191298828125,9.449245937499999L15.05601298828125,3.3633379375C14.54009298828125,2.8463349375,13.70246298828125,2.8463349375,13.18651298828125,3.3633379375L7.1006129882812505,9.449245937499999C6.26529298828125,10.2845659375,6.84869298828125,11.7165359375,8.02874298828125,11.7165359375L10.136932988281249,11.7165359375L10.136932988281249,18.3460859375C10.136932988281249,19.0752859375,10.73359298828125,19.6719859375,11.46283298828125,19.6719859375ZM6.15921298828125,22.3237859375L22.07011298828125,22.3237859375C22.79931298828125,22.3237859375,23.39601298828125,22.9203859375,23.39601298828125,23.6496859375C23.39601298828125,24.3788859375,22.79931298828125,24.9755859375,22.07011298828125,24.9755859375L6.15921298828125,24.9755859375C5.42996998828125,24.9755859375,4.83331298828125,24.3788859375,4.83331298828125,23.6496859375C4.83331298828125,22.9203859375,5.42996998828125,22.3237859375,6.15921298828125,22.3237859375Z" fill="#F4F7FF" fillOpacity="1"/></g></g></g></svg> */}
                              {hasPermission("edit_role") && (
                                <svg
                                  onClick={() => {
                                    setEditedRole(data);
                                    setEditRole(true);
                                  }}
                                  className="cursor-pointer"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  version="1.1"
                                  width="28"
                                  height="28"
                                  viewBox="0 0 28 28"
                                >
                                  <defs>
                                    <clipPath id="master_svg0_247_14308">
                                      <rect
                                        x="0"
                                        y="0"
                                        width="28"
                                        height="28"
                                        rx="0"
                                      />
                                    </clipPath>
                                  </defs>
                                  <g>
                                    <g clipPath="url(#master_svg0_247_14308)">
                                      <g>
                                        <path
                                          d="M3.5,20.124948752212525L3.5,24.499948752212525L7.875,24.499948752212525L20.7783,11.596668752212524L16.4033,7.2216687522125245L3.5,20.124948752212525ZM24.1617,8.213328752212524C24.6166,7.759348752212524,24.6166,7.0223187522125246,24.1617,6.568328752212524L21.4317,3.8383337522125243C20.9777,3.3834207522125244,20.2406,3.3834207522125244,19.7867,3.8383337522125243L17.651699999999998,5.973328752212524L22.0267,10.348338752212523L24.1617,8.213328752212524Z"
                                          fill="#F4F7FF"
                                          fillOpacity="1"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </svg>
                              )}
                              <svg
                                onClick={() => {
                                  setSelectedId(data.id);
                                  setDeleteModal(true);
                                }}
                                className="cursor-pointer"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                version="1.1"
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                              >
                                <defs>
                                  <clipPath id="delete_icon_clip">
                                    <rect x="0" y="0" width="28" height="28" rx="0" />
                                  </clipPath>
                                </defs>
                                <g clipPath="url(#delete_icon_clip)">
                                  <path
                                    d="M6.9997,24.5H21V8.16667H6.9997V24.5ZM22.1663,4.66667H18.083L16.9163,3.5H11.083L9.9163,4.66667H5.833V7H22.1663V4.66667Z"
                                    fill="#F4F7FF"
                                    fillOpacity="1"
                                  />
                                </g>
                              </svg>
                              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_247_14302"><rect x="0" y="0" width="28" height="28" rx="0" /></clipPath></defs><g><g clipPath="url(#master_svg0_247_14302)"><g><path d="M6.9996778125,24.5L20.9997078125,24.5L20.9997078125,8.16667L6.9996778125,8.16667L6.9996778125,24.5ZM22.1663078125,4.66667L18.0830078125,4.66667L16.9163078125,3.5L11.0830078125,3.5L9.9163378125,4.66667L5.8330078125,4.66667L5.8330078125,7L22.1663078125,7L22.1663078125,4.66667Z" fill="#F4F7FF" fillOpacity="1" /></g></g></g></svg> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
              <div className="grid grid-cols-3 w-fit absolute bottom-0 right-0">
                <button
                  className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[8px_0px_0px_8px] bg-[#575F6F] disabled:opacity-50"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  {t("Prev")}
                </button>
                <button className="font-medium text-xs leading-[21px] text-[#181D26] py-1 px-3 bg-[#D4AB0B]">
                  {currentPage}
                </button>
                <button
                  className="font-medium text-xs leading-[21px] text-[#B3BACA] py-1 px-[14px] rounded-[0px_8px_8px_0px] bg-[#575F6F] disabled:opacity-50"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  {t("Next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {addRole && (
          <motion.div
            key="add-overlay"
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddRole(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl leading-[36px] text-white font-noto">
                    Add Role
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAddRole(false)}
                    className="text-[#98A1B3] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                  <label className="text-xs leading-[21px] text-[#98A1B3]">
                    Role name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                    placeholder="Role name"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {Object.entries(permissions).map(
                  ([category, permissionList]) => (
                    <div key={category} className="flex flex-col gap-2 mb-4">
                      <label className="text-xs leading-[21px] text-[#98A1B3]">
                        {category}
                      </label>
                      <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                        {permissionList.map((permission) => {
                          const isSelected = selectedPermissions.includes(
                            permission.id
                          );
                          return (
                            <button
                              key={permission.id}
                              type="button"
                              onClick={() => togglePermission(permission.id)}
                              className={`font-medium text-sm leading-[20px] w-fit px-4 py-2 rounded-full transition-all ${isSelected
                                ? "bg-[#446FC7] text-white"
                                : "bg-[#303847] text-[#F4F7FF] hover:bg-[#446FC7] hover:text-white"
                                }`}
                            >
                              {formatPermissionName(permission.name)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                <div className="mt-auto flex gap-4 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAddRole(false)}
                    className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex justify-center items-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition"
                  >
                    {loading ? <Loader primary /> : "Save"}
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editRole && editedRole && (
          <motion.div
            key="edit-overlay"
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditRole(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="absolute right-0 top-0 h-full w-full max-w-[568px] bg-[#252C38] shadow-xl overflow-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl leading-[36px] text-white font-noto">
                    Edit Role
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditRole(false)}
                    className="text-[#98A1B3] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col w-full px-4 pt-2 py-2 rounded-[4px_4px_0px_0px] bg-[#222834] border-b border-b-[#98A1B3]">
                  <label className="text-xs leading-[21px] text-[#98A1B3]">
                    Role name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#222834] text-[#F4F7FF] text-base placeholder:text-[#98A1B3] focus-visible:outline-none"
                    placeholder="Role name"
                    value={editedRole.name}
                    onChange={(e) =>
                      setEditedRole({ ...editedRole, name: e.target.value })
                    }
                    required
                  />
                </div>

                {Object.entries(permissions).map(
                  ([category, permissionList]) => (
                    <div key={category} className="flex flex-col gap-2">
                      <label className="text-xs leading-[21px] text-[#98A1B3]">
                        {category}
                      </label>
                      <div className="flex flex-wrap gap-x-3 gap-y-[14px]">
                        {permissionList.map((permission) => {
                          const isSelected = editedRole.permissions.some(
                            (p) => p.id === permission.id
                          );
                          return (
                            <button
                              key={permission.id}
                              onClick={() =>
                                toggleEditPermission(permission.id)
                              }
                              className={`px-4 py-2 rounded-full text-sm transition ${isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-white hover:bg-blue-600"
                                }`}
                            >
                              {formatPermissionName(permission.name)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                <div className="mt-auto flex gap-4 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setEditRole(false)}
                    className="font-medium text-base text-[#868686] bg-[#252C38] px-12 py-3 border border-[#868686] rounded-full hover:bg-[#868686] hover:text-[#252C38] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditRole}
                    className="flex items-center justify-center font-medium text-base text-[#181D26] bg-[#EFBF04] px-12 py-3 border border-[#EFBF04] rounded-full hover:bg-[#181D26] hover:text-[#EFBF04] transition"
                  >
                    {loading ? <Loader primary /> : "Save"}
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="fixed w-screen h-screen flex justify-center items-center top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)]"
            key="add-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal(false)}>
            <DeleteModal loading={loading} setModal={setDeleteModal} handleDelete={handleDelete} />
          </motion.div>
        )}
      </AnimatePresence>
    </SecondLayout>
  );
};

export default RolesPage;

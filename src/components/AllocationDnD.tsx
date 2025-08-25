import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import employeeService from "../services/employeeService";
import siteEmployeeService from "../services/siteEmployeeService";
import { Employee } from "../types/employee";
import { Site } from "../types/site";
import { SiteEmployee } from "../types/siteEmployee";
import { User } from "../types/user";
import { PersonStanding } from "lucide-react";
import { Role } from "../types/role";

interface EmployeeCardProps {
  employee: User;
  draggable?: boolean;
}

const dummyRole: Role = {
  id: "r-001",
  name: "Technician",
  permissions: [
    {
      id: "p-001",
      name: "view_site",
      category: "Site Management",
    },
    {
      id: "p-002",
      name: "edit_profile",
      category: "User Management",
    },
  ],
};

export const dummyUser: User = {
  id: "u-001",
  name: "John Doe",
  mobile: "+6581234567",
  address: "123 Orchard Road, Singapore",
  profile_image: "",
  email: "john.doe@example.com",
  last_login: new Date().toISOString(),
  role: dummyRole,
  nric_fin_no: "S1234567A",
  briefing_date: new Date().toISOString(),
  birth: "1990-01-01",
  briefing_conducted: "2023-05-12",
  date_joined: "2021-07-01",
  status: "active",
  language: "English",
};

const EmployeeCard = ({ employee, draggable = true }: EmployeeCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id,
  });

  const style =
    draggable && transform
      ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
      : undefined;

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={style}
      className="bg-[#1e2229] rounded-md p-3 mb-2 flex items-center gap-2"
    >
      <div className="!w-5 !h-5">
        {employee.profile_image ? (
          <img src="" className="w-5 h-5 fill-white" />
        ) : (
          <PersonStanding color="white" width={20} height={20} />
        )}
      </div>
      <span className="text-white break-all">{employee.name}</span>
    </div>
  );
};

const EmployeeDropZone = ({ employees }: { employees: User[] }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "employee-dropzone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full p-6 rounded-md border min-h-[500px] h-full flex flex-col flex-1 bg-[#252C38] ${
        isOver ? "border-[#F3C511]" : "border-[#252C38]"
      }`}
    >
      <h3 className="font-semibold mb-3 text-2xl text-white">
        List of Employees
      </h3>
      <div className="flex flex-col flex-1 h-full">
        {employees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} draggable={true} />
        ))}
      </div>
    </div>
  );
};

const SiteDropZone = ({ site, users }: { site: Site; users: User[] }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `site-${site.id}`,
  });

  const baseURL = new URL(process.env.REACT_APP_API_URL || "");
  baseURL.pathname = baseURL.pathname.replace(/\/api$/, "");

  return (
    <div
      ref={setNodeRef}
      className={`p-4 min-h-[100px] h-fit w-full bg-[#181D26] rounded-md border mb-4 lg:w-1/2 xl:w-1/3 flex flex-col gap-4 ${
        isOver ? "border-[#F3C511]" : "border-[#181D26]"
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src={`${site.image ? baseURL + "storage/" + site.image : site.image}`}
          alt=""
          className="h-10 rounded"
        />
        <p className="font-semibold text-white break-all">{site.name}</p>
      </div>
      {users.map((emp) => (
        <EmployeeCard key={emp.id} employee={emp} draggable={true} />
      ))}
      {isOver && (
        <EmployeeCard
          key={dummyUser.id}
          employee={dummyUser}
          draggable={true}
        />
      )}
    </div>
  );
};

const AllocationDnD = ({
  sites,
  setLoading,
  allocationType,
  shiftType,
  date,
}: {
  sites: Site[];
  setLoading: Dispatch<SetStateAction<boolean>>;
  allocationType: string;
  shiftType: string;
  date: string;
}) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<SiteEmployee[]>([]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/auth/login");
      }

      const response = await employeeService.getAllEmployee(token);

      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSiteEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/auth/login");
      }

      const response = await siteEmployeeService.getAllSiteEmployee(
        token,
        allocationType,
        shiftType,
        date
      );

      if (response.success) {
        const data: SiteEmployee[] = response.data;

        let filtered: SiteEmployee[] = [];

        if (allocationType === "bydate") {
          filtered = data.filter(
            (item) => item.shift === shiftType && item.date === date
          );
        } else if (allocationType === "bymonth") {
          const [year, month] = date.split("-");

          filtered = data.filter(
            (item) =>
              item.shift === shiftType &&
              item.date.startsWith(`${year}-${month}`)
          );
        }

        setAssignments(filtered);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = async () => {
    await fetchSiteEmployees();
    await fetchEmployees();
  };

  useEffect(() => {
    if (allocationType && shiftType && date) {
      loadData();
    }
  }, [allocationType, shiftType, date]);

  const handleDragEnd = async (event: DragEndEvent) => {
    setLoading(true);
    const { over, active } = event;
    if (!over) return;

    const dropId = over.id.toString();
    const employeeId = active.id.toString();

    const employeeObj = employees.find((e) => e.id.toString() === employeeId);
    if (!employeeObj) return;

    if (dropId.startsWith("site-")) {
      const siteId = dropId.replace("site-", "");

      setEmployees((prev) =>
        prev.filter((e) => e.id.toString() !== employeeId)
      );

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          localStorage.clear();
          navigate("/auth/login");
        }

        const response = await siteEmployeeService.allocationUserToSite(
          siteId,
          token,
          employeeId,
          allocationType,
          shiftType,
          date
        );

        if (response.success) {
          toast.success("Site allocated successfully");
          loadData();
        }
      } catch (error: any) {
        toast.error("Failed to allocated site");
      } finally {
        setLoading(false);
      }
    } else if (dropId === "employee-dropzone") {
      const matchedAssignments = assignments.filter((a) => {
        if (a.user.id !== employeeId) return false;
        if (a.shift !== shiftType) return false;

        if (allocationType === "bydate") {
          return a.date === date;
        } else if (allocationType === "bymonth") {
          const [year, month] = date.split("-");
          return a.date.startsWith(`${year}-${month}`);
        }

        return false;
      });

      const firstAssignment = matchedAssignments[0];

      const siteId = firstAssignment?.site?.id;

      setEmployees((prev) =>
        prev.find((e) => e.id.toString() === employeeId)
          ? prev
          : [...prev, employeeObj]
      );

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          localStorage.clear();
          navigate("/auth/login");
        }

        const response = await employeeService.disallocationUserFromSite(
          token,
          employeeId,
          siteId,
          allocationType,
          shiftType,
          date
        );

        if (response.success) {
          toast.success("Site allocated successfully");
          loadData();
        }
      } catch (error) {
        toast.error("Failed to allocated site");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("Assignments:", assignments);
    console.log(
      "Filtered employees:",
      employees.filter((e) => !assignments.find((a) => a.user.id === e.id))
    );
  }, [assignments, employees]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 flex-1 h-full lg:flex-row">
        <div className="w-full lg:w-1/3 flex flex-1 h-full">
          <EmployeeDropZone
            employees={employees.filter(
              (e) => !assignments.find((a) => a.user.id.trim() === e.id.trim())
            )}
          />
        </div>
        <div className="w-full lg:w-2/3 flex flex-col bg-[#252C38] p-6 rounded-md h-full min-h-[500px]">
          <h3 className="font-semibold mb-3 text-2xl text-white">
            List of Sites
          </h3>
          <div className="w-full flex gap-2">
            {sites.map((site) => (
              <SiteDropZone
                key={site.id}
                site={site}
                users={assignments
                  .filter((a) => a.site.id === site.id)
                  .map((a) => a.user)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default AllocationDnD;

import { Attendance } from "./attendance";
import { Employee } from "./employee";
import { Site } from "./site";
import { User } from "./user";

export type SiteEmployee = {
    id: string;
    employee: User;
    site: Site;
    date: string;
    shift: string;
    attendance: Attendance | null;
}
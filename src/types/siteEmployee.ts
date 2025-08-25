import { Attendance } from "./attendance";
import { Employee } from "./employee";
import { Site } from "./site";
import { User } from "./user";

export type SiteEmployee = {
    id: string;
    user: User;
    site: Site;
    date: string;
    shift: string;
    attendance: Attendance | null;
}
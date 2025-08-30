import { Site } from "./site";
import { SiteEmployee } from "./siteEmployee";
import { User } from "./user";

export type Attendance = {
    id: string;
    site: Site;
    user: User;
    time_in?: string;
    time_out?: string;
    reason?: string;
    check_in_time?: string;
    check_out_time?: string;
    shift: string;
    date: string;
}
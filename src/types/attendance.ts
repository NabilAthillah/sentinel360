import { SiteEmployee } from "./siteEmployee";

export type Attendance = {
    id: string;
    id_site_employee: string;
    site_employee: SiteEmployee;
    time_in?: string;
    time_out?: string;
    reason?: string;
    check_in_time?: string;
    check_out_time?: string;
}
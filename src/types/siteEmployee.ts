import { Employee } from "./employee";
import { Site } from "./site";

export type SiteEmployee = {
    id: string;
    employee: Employee;
    site: Site;
    date: string;
    shift: string;
}
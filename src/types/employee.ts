import { Site } from "./site";
import { User } from "./user";
export type Employee = {
    id: string;
    nric_fin_no: string;
    briefing_date: Date;
    user: User;
    birth? : string;
    briefing_conducted?: string;
    reporting: User;
    site?: Site;
    date_joined?: string;
}
import { Employee } from "./employee";
import { Role } from "./role";

export type User = {
        id: string;
        name: string;
        mobile: string;
        address?: string;
        profile_image?: string;
        email: string;
        last_login?: string;
        role: Role;
        nric_fin_no: string;
        briefing_date: string;
        birth? : string;
        briefing_conducted?: string;
        date_joined?: string;
        status?: string;
        language?: string;
}
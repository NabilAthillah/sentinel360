import { Employee } from "./employee";
import { Role } from "./role";

export type User = {
        id: string;
        name: string;
        mobile: string;
        address?: string;
        profile_image?: string;
        email: string;
        status: string;
        role: Role;
        employee?: Employee;
}
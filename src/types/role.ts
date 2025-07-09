import { Permission } from "./permission";

export type Role = {
        id: string;
    name: string;
    // status: string;
    permissions: Permission[];
}
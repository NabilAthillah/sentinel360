import { User } from "./user";
export type AuditTrail = {
    id: string;
    title: string;
    description?: string ;
    status?: string ;
    created_at: string;
    user: User;
}
import { Site } from "./site";
import { User } from "./user";
export type LeaveManagement = {
    id: string;
    user?: User;
    type: string;
    from: string;
    to: string;
    total: number;
    date_submitted: string;
    status?: string;
    created_at: string;
    updated_at: string;
    site: Site;
};

export type LeaveManagement = {
    id: string;
    user: {
        id: string;
        name: string;
    };
    type: string;
    from: string;          
    to: string;           
    total: number;         
    date_submitted: string; 
    status: "active" | "deactive";
    created_at: string;
    updated_at: string;
};

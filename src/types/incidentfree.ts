import { Site } from "./site";
import { IncidentType } from "./incidentType";

export type IncidentFree = {
    id: string;
    why_happened?: string;
    how_happened?: string;
    persons_involved?: string;
    persons_injured?: string;
    happened_at: string;
    details?: string;
    ops_incharge?: string;
    reported_to_management: boolean;
    management_report_note?: string;
    reported_to_police: boolean;
    police_report_note?: string;
    property_damaged: boolean;
    damage_note?: string;
    cctv_image?: string;
    site: Site;
    incident_type: IncidentType;
    user: {
        id: string; 
        name: string; 
    };
};

import { Route } from "./route";

export type Site = {
    id: string;
    name: string;
    email?: string;
    image?: string;
    mcst_number?: string;
    managing_agent?: string;
    person_in_charge?: string;
    mobile?: string;
    address: string;
    postal_code: string;
    lat: string;
    long: string;
    organisation_chart?: string;
    routes?: Route[];
}
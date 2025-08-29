import { Route } from "./route";
import { Site } from "./site";

export type Pointer = {
    id: string;
    name: string;
    nfc_tag: string;
    remarks?: string;
    route: Route;
    created_at: string;
    order: number;
}
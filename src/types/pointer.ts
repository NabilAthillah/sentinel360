import { Route } from "./route";
import { Site } from "./site";

export type Pointer = {
    id: string;
    nfc_tag: string;
    remarks?: string;
    route: Route;
    status: string;
    site: Site;
}
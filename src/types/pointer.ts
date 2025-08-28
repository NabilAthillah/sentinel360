import { Route } from "./route";

export type Pointer = {
    id: string;
    nfc_tag: string;
    remarks?: string;
    route: Route;
}
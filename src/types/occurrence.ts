import { OccurrenceCategory } from "./occurrenceCategory";
import { Site } from "./site";
import { User } from "./user";

export type Occurrence = {
    id: string;
    date: string;
    time: string;
    detail?: string;
    site: Site;
    category: OccurrenceCategory;
    reported_by: User;
}
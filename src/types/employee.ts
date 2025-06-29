import { Site } from "./site";
import { User } from "./user";

export type Employee = {
      id: string;
    nric_fin_no: string;
    briefing_date: Date;
    user: User;
    reporting: User;
    site?: Site;
}
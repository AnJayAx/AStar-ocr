import { IEpcId } from "./EpcId";

export interface IRefurbishment {
    "Status": string;
    "MRO_Description": string;
    "Refurbish_Operation": string;
    "EPCIDS": IEpcId[];
}

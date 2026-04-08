import { IPLListItem } from "./PLListItem";

export interface IPLOrderItem {
    "Verification_ID": number;
    "Order_No": string;
    "Display_ID": string;
    "IsNormalPicking": boolean;
    "Status": string;
    "Label"?: string;   
    "Customer_ID": number;
    "PickingList": IPLListItem[];
}
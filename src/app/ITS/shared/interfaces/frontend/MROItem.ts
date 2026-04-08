// export interface IMROItem {
//     "EPC_ID": string;
//     //"Asset_ID": string;
//     //"PIC": string;
//     "DocumentNo": string;
//     "userid": string;
//     "Remarks": string
// }

export interface IMRORecord {
    "Asset_MRO_History_ID"?: number;
    "Display_ID"?: string;
    "Creator"?: string;
    "Creation_Time"?: string;
    "Edit_Time"?: string;
    "Availability"?: number;
    "Status": string;
    "Date": string;
    "MRO_Description": string;
    "Asset_ID": number;
    "MHID_Offline": string;
    "Refurbish_Operation": string;
    "Faults": string;
    "Spare_parts": string;
    "Rental": true;
    "Chargeable": true;
    "Under_Warranty": true;
    "MRODateS"?: string;
    "SubMRO": ISubMRO[]
}

export interface ISubMRO {
    "Sub_MRO_ID"?: number;
    "Display_ID"?: string;
    "Creator"?: string;
    "Creation_Time"?: string;
    "Edit_Time"?: string;
    "Availability"?: number;
    "Status"?: string;
    
    "Description": string;
    "PartNo": string;
    "Unit_Price": number;
    "Qty": number;
    "Asset_MRO_History_ID": number;
}
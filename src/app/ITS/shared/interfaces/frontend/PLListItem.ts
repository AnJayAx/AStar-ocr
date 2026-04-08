import { IPLTagItem } from "./PLTagItem";

export interface IPLListItem {
    "Verification_ID": number;
    "Display_ID": string;
    "Order_No": string;
    "PickingList_ID": number;

    "Category": string;
    "Description": string;
    "SKU": string;
    "Location": IPLRefLocation[];
    "Qty": number;  /* Required qty */
    "UOM": string;
    "BatchNo": string;
    "Date_of_Expire": string;

    "TagItems": IPLTagItem[]; /* picked items with scanned information */

    /* For internal processing */
    "_id": string;
    "_picked": number;   /* Picked qty */
    "_mDetected": boolean; 
    "_remainingQty": number;    /* Qty - _picked ; Should not be less than zero */
}

export interface IPLRefLocation {
    "Location_Name": string;
    "Qty": number; /* qty available in location */
}
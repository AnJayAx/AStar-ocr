export interface IPLTagItem {
    "Verification_ID": number;
    "PickingList_ID": number;
    "Display_ID": string;
    "Asset_ID": number;
    "Status": string;
    
    "IsIndividual": string;
    "Category": string;
    "Description": string;
    "Date_of_Expire": string;
    "BatchNo": string;
    "SKU": string;
    "EPC_ID": string;
    "Qty": number;  /* item required picking qty */
    "LastBal": number; /* item balance before picking */
    
    "_id": string; /* to match parent list item ID */
    "_location": string;
    "_picked": number;   /* picked qty */
    "_balance": number; /* item lastbalance - picked qty*/
}
export interface IPLOrder {
    "Verification_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Status": string;
    "Order_No": string;
    "Date_Created": string;
    "Description": string;
    "Ref_Name": string;
    "Remarks": string;
    "isNormalPicking": boolean;
    "From_Location_ID": number;
    "From_Location": string;
    "Destination_Location_ID": number;
    "Destination_Location": string;

    "CustomerAddress_ID": number;
    "Customer_ID": number;
    "Is_To_LPT_Task": string;
    "LPT_Task_Created": string;
    "Packed_Time": string;
    "Sender_CustomerAddress_ID": number;
    "Sender_Customer_ID": number;
    "User_Name": string;
    "DriverName": string;
  
    "Lines": ILine[];
}

export interface ILine {
    "PickingList_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Status": string;
    "Category": string;
    "Description": string;
    "Qty": number; /* sum of qty in picked lines */
    "Remarks": string;
    "Verification_ID": number;
    "Date_of_Expire": string;
    "BatchNo": string;
    "SKU": string;
    "Ref_Loc": string;
    "UOM": string;
    "PickedLines": IPickedLine[];
}

export interface IPickedLine {
    "PickedItem_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Status": string;
    "Asset_ID": number;
    "Qty": number;  /* picked qty */
    "PickingList_ID": number;
    "EPC_ID": string;
    "PickedItem_Status": string;
    "Ver_Qty": number;
    "Verification_ID": number;
    "Receiving_Location_ID": number;
    "Receiving_Location": string;
    "From_Location_ID": number;
    "From_Location": string;
    "Received_Qty": number;
    "Received_Remarks": string;
    "Received_Status": string;
    "Remarks": string;
    "Received_By": string;
    "Category": string;
    "Description": string;
    "OrderQty": number;
    "PLRemarks": string;
    "Date_of_Expire": string;
    "BatchNo": number;
    "SKU": string;
    "ItemDescription": string;
    "ItemSKU": string;
    "ItemBatchNo": string;
}

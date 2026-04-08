export interface IReceiveVerifyOrder {
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
    "Lines": IReceiveVerifyOrderLine[];
}

export interface IReceiveVerifyOrderLine {
    "PickingList_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Status": string;
    "Category": string;
    "Description": string;
    "Qty": number;
    "Remarks": string;
    "Verification_ID": 0;
    "Date_of_Expire": string;
    "BatchNo": string;
    "SKU": string;
    "Ref_Loc": string;
    "PickedLines": IReceiveVerifyOrderPickedLine[];
}

export interface IReceiveVerifyOrderPickedLine {
    "PickedItem_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Status": string;
    "Asset_ID": number;
    "Qty": number;
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
    "BatchNo": string;
    "SKU": string;
    "ItemDescription": string;
    "ItemSKU": string;
    "ItemBatchNo": string;
    "SM": string;
}
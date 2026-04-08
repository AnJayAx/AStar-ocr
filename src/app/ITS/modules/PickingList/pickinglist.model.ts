export class PickedLine {
    "PickedItem_ID" = 0;
    "Display_ID" = "";
    "Creator" = undefined;
    "Creation_Time" = "";
    "Edit_Time" = "";
    "Status" = "";
    "Asset_ID" = undefined;
    "Qty" = undefined;  /* refers to picked qty */
    "PickingList_ID" = undefined;
    "EPC_ID" = undefined;
    "PickedItem_Status" = "";
    "Ver_Qty" = 0;
    "Verification_ID" = undefined;   
    "Receiving_Location_ID" = 0;
    "Receiving_Location" = "";
    "From_Location_ID" = 0;
    "From_Location" = "";
    "Received_Qty" = 0;
    "Received_Remarks" = "";
    "Received_Status" = "";
    "Remarks" = "";
    "Received_By" = "";
    "Category" = undefined;
    "Description" = undefined;
    "OrderQty" = 0;
    "PLRemarks" = "";
    "Date_of_Expire" = undefined;
    "BatchNo" = undefined;
    "SKU" = undefined;
    "ItemDescription" = "";
    "ItemSKU" = "";
    "ItemBatchNo" = "";
}

export class PickedItemByHHLite {
    "Asset_ID": number;
    "Qty": number;
    "PickingList_ID": number;
    "EPC_ID": string;
    "Verification_ID": number;
    "Remarks": string;
    "SM": string;
    "Package_Master_ID": string;
    "Weight": string
}

export class PickedItemByHH {
    "PickedItem_ID" = 0; 
    "Display_ID" = undefined;
    "Creator" = undefined;
    "Creation_Time" = "";
    "Edit_Time" = "";
    "Status" = "";
    "Asset_ID" = undefined;
    "Qty" = undefined; /* picked qty */
    "PickingList_ID" = undefined;
    "EPC_ID" = undefined;
    "PickedItem_Status" = "";
    "Ver_Qty" = 0;
    "Verification_ID" = undefined;
    "Receiving_Location_ID" = 0;
    "Receiving_Location" = "";
    "From_Location_ID" = 0;
    "From_Location" = "";
    "Received_Qty" = 0;
    "Received_Remarks" = "";
    "Received_Status" = "";
    "Remarks" = undefined;
    "Received_By" = "";
    "Category" = undefined;
    "Description" = undefined;
    "OrderQty" = 0;
    "PLRemarks" = "";
    "Date_of_Expire" = undefined;
    "BatchNo" = undefined;
    "SKU" = undefined;
    "ItemDescription" = ""; 
    "ItemSKU" = "";
    "ItemBatchNo" = "";
    "SM" = undefined;
    "Package_Master_ID" = undefined;     
    "Weight" = undefined; 
}
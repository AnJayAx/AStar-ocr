import { IOperation } from "./Operation";

export interface IProductionTravelerItemInfo {
    "IsIndividual": string;
    "Category": string;
    "Description": string;
    "EPC_ID": string;
    "Asset_No": string;
    "Date_of_Purchase": string;
    "Date_of_PurchaseS": string;
    "Asset_ID": number;
    "Asset_Status_ID": number;
    "Date_of_Scrap": string;
    "Cost": number;
    "PIC": string;
    "Asset_Location_ID": number;
    "Yearly_Depreciation": number;
    "Current_Value": number;
    "Remarks": string;
    "Ref_No": string;
    "Minor_Category": string;
    "Vendor_Name": string;
    "SKU": string;
    "UOM": string;
    "BatchNo": string;
    "Remarks5": string;
    "Remarks6": string;
    "Warranty_Expiry_Date": string;
    "Calibration_Date": string;
    "Remarks2": string;
    "Date_of_Expire": string;
    "Date_of_ExpireS": string;
    "LastBal": number;
    "Remarks3": string;
    "Remarks4": string;
    "Container_ID": string;
    "Asset_LocationLocation": string;
    "Asset_StatusName": string;
    "ContainerName": string;
    "Container_Int_Loc": string;
    "Image_ID": string;
    "Vendor_Invoice": string;
    "Useful_Life": string;
    "Edit_Time": string;
    "EditTime": string;
    "ImageName": string;
    "isFirtExpireAlert": string;
    "isSecondExpireAlert": string;
    "isWarrantyExpiryDateAlert": string;
    "isCalibrationDateAlert": string;
    "IsPrint": boolean;
    "CO": IOperation;
    "NO": IOperation;
    "IsLastOperation": boolean;                                                                                                                               
}

export interface ICo {                                                                                                                                                                
    "Operation_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Availability": string;
    "Status": string;
    "OpAc": number;
    "Operation_short_text": string;
    "Valid_From": string;
    "Work_ctr": string;
    "Base_Quantity": number;
    "UOM": string;
    "Item_Master_ID": string;
    "QC_Type": string;
  }

export interface INo {                                                                                                                                                               
    "Operation_ID": number;
    "Display_ID": string;
    "Creator": string;
    "Creation_Time": string;
    "Edit_Time": string;
    "Availability": string;
    "Status": string;
    "OpAc": number;
    "Operation_short_text": string;
    "Valid_From": string;
    "Work_ctr": string;
    "Base_Quantity": string;
    "UOM": string;
    "Item_Master_ID": string;
    "QC_Type": string;
}
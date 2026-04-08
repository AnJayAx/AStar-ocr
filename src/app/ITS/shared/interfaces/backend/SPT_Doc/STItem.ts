import { STStatus } from "@its/modules/Stocktaking/stocktaking.constants";

export interface ISTItem {
  "Stock_Taking_Item_ID": number;
  "Display_ID": string;
  "Creator": string;
  "Creation_Time": string;
  "Edit_Time": string;
  "Status": STStatus;
  "Category": string;
  "Asset_ID": number;
  "EPC_ID": string;
  "ItemDescription": string;
  "SKU": string;
  "PIC": string;
  "Ref_No": string;
  "St_No": string;
  "STDescription": string;
  "Date": string;
  "Asset_Location_ID": number;
  "Location": string;
  "Prev_Bal": number;
  "Current_Bal": number;
  "Balance": number;
  "ST_Qty": number;
  "Remarks": string;
  "SM": string;
  "Asset_No": string;
}
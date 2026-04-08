import { IEpcId } from "./EpcId";
import { IOperation } from "./Operation";
import { ISimpleBom } from "./SimpleBom";

export interface IFirstOperation {
  "Category": string;
  "WO": string;
  "Description": string;
  "SKU": string;
  "IsRunningBatchNo": string;
  "BatchNo": string;
  "Manufacturing_Date": string;
  "Confirmed_Quantity": string;
  "Packing_Quantity": string;
  "Packing_Unit": string;
  "Location": string;
  "Date_of_Expire": string;
  "Remarks": string;
  "IsAutoEPCID": string;
  "Assigned_EPCIDs": IEpcId[],
  "BOM": ISimpleBom[],
  "Operation": IOperation
}
  
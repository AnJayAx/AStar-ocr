import { IOperation } from "./Operation";
import { ISimpleBom } from "./SimpleBom";

export interface IOperationTraveler {
    "WO": string;
    "QC_Action": string;
    "QC_Remarks": string;
    "Items": IOperationTravelerItem[];
    "BOM": ISimpleBom[];
    "Operation": IOperation;
}

export interface IOperationTravelerItem {
    "EPC_ID": string;
    "Qty": string;
    "Remarks": string;
    "DocNo": string;
    "userid": string;
    "ST_Status": string;
    "needsUpdateLocation": string;
    "selectedLocationID": string;
}
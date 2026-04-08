import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IFirstOperation } from "@its/shared/interfaces/backend/FirstOperation";
import { IOperationTraveler } from "@its/shared/interfaces/backend/OperationTraveler";

export enum Qc_Action_Type {
  Accept = 'Accept',
  Reject = 'Reject', /* Scrap with Defect in remarks */
  Rework = 'Rework/Sort/RTV',
  UAI = 'UAI', /* Move to the next operation */
}

export const PT_OPERATION_FORM: FormGroup = new FormGroup({
  description: new FormControl(""),
  category: new FormControl("", Validators.required),
  workCenter: new FormControl("", Validators.required),
  batchNo: new FormControl(""),
  isRunningBatchNo: new FormControl(false),
  manufacturingDate: new FormControl(),
  expiryDate: new FormControl(),
  confirmedQty: new FormControl(Validators.required),
  packingQty: new FormControl(Validators.required),
  packingUnit: new FormControl(),
  isAutoRunningEpcId: new FormControl(false)
});

/* null values for compulsory fields, "" for optional fields */
export const FIRST_OPERATION_MODEL: IFirstOperation = {
  "Category": null,
  "WO": "",
  "Description": "",
  "SKU": null,
  "IsRunningBatchNo": "false",
  "BatchNo": "",
  "Manufacturing_Date": null,
  "Confirmed_Quantity": null,
  "Packing_Quantity": null,
  "Packing_Unit": "",
  "Location": null, /* work center */
  "Date_of_Expire": "",
  "Remarks": "",
  "IsAutoEPCID": "false",
  "Assigned_EPCIDs": [],
  "BOM": null,
  "Operation": null,
};

export const OPERATION_TRAVELER_MODEL: IOperationTraveler = {
  "WO": "",
  "QC_Action": "",
  "QC_Remarks": "",
  "Items": [],
  "BOM": [],
  "Operation": null,
}
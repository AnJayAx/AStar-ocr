import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IFirstOperation } from '@its/shared/interfaces/backend/FirstOperation';
import { IOperation } from '@its/shared/interfaces/backend/Operation';
import { BehaviorSubject, Observable, combineLatest, forkJoin } from 'rxjs';
import { FIRST_OPERATION_MODEL, OPERATION_TRAVELER_MODEL, PT_OPERATION_FORM, Qc_Action_Type } from '@its/modules/ProductionTraveler/production-traveler.constants';
import { Utils } from '@its/shared/classes/utils';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { ISimpleBom } from '@its/shared/interfaces/backend/SimpleBom';
import { IOperationTraveler, IOperationTravelerItem } from '@its/shared/interfaces/backend/OperationTraveler';
import { IProductionTravelerItemInfo } from '@its/shared/interfaces/backend/ProductionTravelerItemInfo';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ILocations } from '@its/shared/interfaces/backend/locations';

export interface IQcInfo { action: Qc_Action_Type, remarks: string }

@Injectable({
  providedIn: 'root'
})
export class PtSubmissionStoreService {

  private firstOperation: BehaviorSubject<IFirstOperation> = new BehaviorSubject(FIRST_OPERATION_MODEL);
  firstOperation$: Observable<IFirstOperation> = this.firstOperation.asObservable();
  get currentFirstOperation(): IFirstOperation { return this.firstOperation.getValue(); }

  private operationTraveler: BehaviorSubject<IOperationTraveler> = new BehaviorSubject(OPERATION_TRAVELER_MODEL);
  operationTraveler$: Observable<IOperationTraveler> = this.operationTraveler.asObservable();
  get currentOperationTraveler(): IOperationTraveler { return this.operationTraveler.getValue(); }

  constructor(
    private _itsService: ItsServiceService,
  ) { }

  reset() {
    this.firstOperation.next(FIRST_OPERATION_MODEL);
    this.operationTraveler.next(OPERATION_TRAVELER_MODEL);
  }

  get currentFirstOperationId(): number {
    return this.firstOperation?.getValue()?.Operation.Operation_ID;
  }

  setFirstOperationSku(sku: string): void {
    let newFirstOperation = this.firstOperation.getValue();
    newFirstOperation["SKU"] = sku;
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationSku', newFirstOperation);
  }

  setFirstOperationWorkOrder(workOrder: string): void {
    let newFirstOperation = this.firstOperation.getValue();
    newFirstOperation["WO"] = workOrder;
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationWorkOrder', newFirstOperation);
  }

  setFirstOperationOperation(operation: IOperation): void {
    let newFirstOperation = this.firstOperation.getValue();
    newFirstOperation["Operation"] = operation;
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationOperation', newFirstOperation);
  }

  get currentFirstOperationOperationId(): number {
    return !!this.firstOperation.getValue().Operation ? this.firstOperation.getValue().Operation.Operation_ID : null;
  }

  setFirstOperationFormInfo(userForm: FormGroup): void {
    let newFirstOperation: IFirstOperation = this.firstOperation.getValue();
    newFirstOperation["Description"] = userForm.get('description').value;
    newFirstOperation["Category"] = userForm.get('category').value;
    newFirstOperation["IsRunningBatchNo"] = userForm.get('isRunningBatchNo').value.toString();
    newFirstOperation["BatchNo"] = newFirstOperation["IsRunningBatchNo"] === 'true' ? "" : Utils.removeNullValue(userForm.get('batchNo').value);
    newFirstOperation["Manufacturing_Date"] = userForm.get('manufacturingDate').value.toDateString();
    newFirstOperation["Confirmed_Quantity"] = userForm.get('confirmedQty').value.toString();
    newFirstOperation["Packing_Quantity"] = userForm.get('packingQty').value.toString();
    newFirstOperation["Packing_Unit"] = Utils.removeNullValue(userForm.get('packingUnit').value);
    newFirstOperation["Location"] = userForm.get('workCenter').value['Asset_Location_ID'].toString();
    newFirstOperation["Date_of_Expire"] =  !!userForm.get('expiryDate').value ? userForm.get('expiryDate').value.toDateString() : "";
    newFirstOperation["IsAutoEPCID"] = userForm.get('isAutoRunningEpcId').value.toString();
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationFormInfo', newFirstOperation);
  }

  setFirstOperationEPCs(epcIds: string[]): void {
    let newFirstOperation = this.firstOperation.getValue();
    const epcIdsParam: IEpcId[] = epcIds.map(id => { return {"EPC_ID": id }; });
    newFirstOperation["Assigned_EPCIDs"] = epcIdsParam;
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationEPCs', newFirstOperation);
  }

  setFirstOperationBOM(bom: ISimpleBom[]): void {
    let newFirstOperation = this.firstOperation.getValue();
    newFirstOperation["BOM"] = bom;
    this.firstOperation.next(newFirstOperation);
    console.log('[pt traveler store] setFirstOperationBOM', newFirstOperation);
  }

  get currentOperationTravelerOperationId(): number {
    return !!this.operationTraveler.getValue().Operation ? this.operationTraveler.getValue().Operation.Operation_ID : null;
  }

  get currentOperationTravelerQcType(): string {
    return !!this.operationTraveler.getValue().Operation ? this.operationTraveler.getValue().Operation.QC_Type : null;
  }

  setOperationTravelerWorkOrder(workOrder: string): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    newOperationTraveler["WO"] = workOrder;
    this.operationTraveler.next(newOperationTraveler);
    console.log('[pt traveler store] setOperationTravelerWorkOrder', newOperationTraveler);
  }
  
  setOperationTravelerItems(items: IProductionTravelerItemInfo[]): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    const currentUser = this._itsService.getKeyCloakUsername();
    const itemsParam: IOperationTravelerItem[] = items.map(item => {
      return {
        "EPC_ID": item["EPC_ID"],
        "Qty": item["LastBal"].toString(),
        "Remarks": item["Remarks"],
        "DocNo": "",
        "userid": currentUser,
        "ST_Status": item["Asset_StatusName"],
        "needsUpdateLocation": "false",
        "selectedLocationID": "",
      } as IOperationTravelerItem
    });
   newOperationTraveler["Items"] = itemsParam;
   this.operationTraveler.next(newOperationTraveler);
   console.log('[pt traveler store] setOperationTravelerItems', newOperationTraveler);
  }

  setOperationTravelerOperation(operation: IOperation): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    newOperationTraveler["Operation"] = operation;
    this.operationTraveler.next(newOperationTraveler);
    console.log('[pt traveler store] setOperationTravelerOperation', newOperationTraveler);
  }

  setOperationTravelerLocation(location: ILocations): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    newOperationTraveler["selectedLocationID"] = location.Asset_Location_ID;
    this.operationTraveler.next(newOperationTraveler);
    console.log('[pt traveler store] setOperationTravelerLocation', newOperationTraveler);
  }

  setOperationTravelerQcInfo(qcInfo: IQcInfo): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    newOperationTraveler['QC_Action'] = qcInfo.action.toString();
    newOperationTraveler['QC_Remarks'] = qcInfo.remarks;
    this.operationTraveler.next(newOperationTraveler);
    console.log('[pt traveler store] setOperationTravelerQcInfo', newOperationTraveler);
  }

  setOperationTravelerBOM(outputBomItems: ISimpleBom[]): void {
    let newOperationTraveler = this.operationTraveler.getValue();
    newOperationTraveler["BOM"] = outputBomItems;
    this.operationTraveler.next(newOperationTraveler);
    console.log('[pt traveler store] setOperationTravelerBOM', newOperationTraveler);
  }
}

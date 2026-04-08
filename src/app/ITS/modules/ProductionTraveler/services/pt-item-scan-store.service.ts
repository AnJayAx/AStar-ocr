import { Injectable } from '@angular/core';
import { IBom } from '@its/shared/interfaces/backend/Bom';
import { IProductionTravelerItemInfo } from '@its/shared/interfaces/backend/ProductionTravelerItemInfo';
import { ILocations } from '@its/shared/interfaces/backend/locations';

@Injectable({
  providedIn: 'root'
})
export class PtItemScanStoreService {
  
  operationTravelerLocationState: ILocations = null;
  operationTravelerDataListState: IProductionTravelerItemInfo[] = [];
  operationTravelerShowBomPanelState: boolean = false;
  operationTravelerInputBomListState: IBom[] = [];
  operationTravelerOperationIdState: number = null;

  updateOperationTravelerLocation(location: ILocations) { this.operationTravelerLocationState = location; }
  updateOperationTravelerDataList(dataList: IProductionTravelerItemInfo[]) { this.operationTravelerDataListState = dataList; }
  updateOperationTravelerShowBomPanel(showBomPanel: boolean) { this.operationTravelerShowBomPanelState = showBomPanel; }
  updateOperationTravelerInputBomList(inputBomList: IBom[]) { this.operationTravelerInputBomListState = inputBomList; }
  updateOperationTravelerOperationId(operationId: number) { this.operationTravelerOperationIdState = operationId; }
  
  reset(): void {
    this.operationTravelerLocationState = null;
    this.operationTravelerDataListState = [];
    this.operationTravelerShowBomPanelState = false;
    this.operationTravelerInputBomListState = [];
    this.operationTravelerOperationIdState = null;
  }

  constructor() { }
}

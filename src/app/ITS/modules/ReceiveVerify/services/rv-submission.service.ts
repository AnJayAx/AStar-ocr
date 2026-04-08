import { Injectable } from '@angular/core';
import { IReceiveVerifyOrderPickedLine } from '@its/shared/interfaces/backend/SPT_Doc/ReceiveVerifyOrder';
import { IRVOrderItem } from '@its/shared/interfaces/frontend/RVOrderItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Observable, switchMap } from 'rxjs';
import { VItemTrackerValue } from './rv-verificationitems-store.service';
import { RVSubmitItemStatus, RVSubmitStatus } from '../receiveverify.constants';

@Injectable({
  providedIn: 'root'
})
export class RvSubmissionService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
  ) { }

  getPostPickedItems(pickedItems: IReceiveVerifyOrderPickedLine[], verificationItemsTracker: Map<string, VItemTrackerValue>, selectedOrder: IRVOrderItem): IReceiveVerifyOrderPickedLine[] {
    const arr: IReceiveVerifyOrderPickedLine[] = [];
    const isDO = selectedOrder.isNormalPicking;
    const destinationLocationID = selectedOrder.destinationLocationID;
    const isNormalPicking = selectedOrder.isNormalPicking;
    
    let isCompleted = true;
    for(var i=0; i<pickedItems.length; i++) {
      const verifiedQty = verificationItemsTracker.get(pickedItems[i].EPC_ID).verifiedQty;
      const isVerified = verifiedQty === pickedItems[i].Qty;
      if (!isVerified) {
        isCompleted = false;
        break;
      }
    }

    let rvListStatus: RVSubmitStatus;
    if (!isNormalPicking && isCompleted) { rvListStatus = RVSubmitStatus.Receive_Done; }
    else if (!isNormalPicking && !isCompleted) { rvListStatus = RVSubmitStatus.Receive_Partial; }
    else if (isNormalPicking && isCompleted) { rvListStatus = RVSubmitStatus.Verify_Done; }
    else { rvListStatus = RVSubmitStatus.Verify_Partial; }

    pickedItems.forEach(item => {
      const verifiedQty = verificationItemsTracker.get(item.EPC_ID).verifiedQty;
      const isVerified = verifiedQty === item.Qty;
      const postItem = Object.assign({}, item);
      postItem['Status'] = rvListStatus;
      postItem['PickedItem_Status'] = "Picked";
      postItem['Ver_Qty'] = verifiedQty;
      postItem['Received_Qty'] = isDO ? 0 : verifiedQty;

      let receivedStatus: RVSubmitItemStatus; 
      if (!isNormalPicking && isVerified) { receivedStatus = RVSubmitItemStatus.Receive_Done; }
      else if (!isNormalPicking && !isVerified) { receivedStatus = RVSubmitItemStatus.Receive_Partial; }
      else if (isNormalPicking && isVerified) { receivedStatus = RVSubmitItemStatus.Verify_Done; }
      else { receivedStatus = RVSubmitItemStatus.Verify_Partial; }

      postItem['Received_Status'] = receivedStatus;
      postItem['Receiving_Location_ID'] = isDO ? null : destinationLocationID;
      postItem['Remarks'] = ''; 
      arr.push(postItem);
    });
    return arr;
  }

  postReceiveVerify(rvItems: IReceiveVerifyOrderPickedLine[]): Observable<any> {
    console.log('[rv-submission svc] postReceiveVerify submit', rvItems);
    return this._itsService.postReceiveVerify(rvItems).pipe(switchMap(response => this._itsdialog.postByHH(response)));
  }

  zeroValuesValidated(verificationItemTracker: Map<string, VItemTrackerValue>): boolean {
    let isValidated = true;
    verificationItemTracker.forEach((value, _) => {
      if (value.verifiedQty === 0) {
        isValidated = false;
        return;
      }
    });
    return isValidated;
  }

}

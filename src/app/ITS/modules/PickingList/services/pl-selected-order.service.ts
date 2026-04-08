import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IPLOrderItem } from '@its/shared/interfaces/frontend/PLOrderItem';
import { IPLTagItem } from '@its/shared/interfaces/frontend/PLTagItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { RefreshService } from '@its/shared/services/refresh.service';
import { BehaviorSubject, Observable, Subject, filter, switchMap, takeUntil } from 'rxjs';
import { PickingListUtils } from '../pickinglist-utils';
// import { IS_M_FULLY_PICKED_SETTING_KEY } from '../pickinglist.constants';
import { IS_M_FULLY_PICKED_SETTING_KEY } from '@its/shared/constants/lptkeys.constants';
import { PlInvalidtagsService } from './pl-invalidtags.service';

@Injectable({
  providedIn: 'root'
})
export class PlSelectedOrderService {
  private destroyed$: Subject<boolean> = new Subject();
  private initialPickedQtys: number[];
  private initialRemainingQtys: number[];
  isMFullyPicked: boolean;
    
  private selectedOrderItemSubject: BehaviorSubject<IPLOrderItem> = new BehaviorSubject(undefined);
  public selectedOrderItem$: Observable<IPLOrderItem> = this.selectedOrderItemSubject.asObservable();
  
  /* flags whether selected order is in the midst of being updated */
  private isUpdatingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isUpdating$: Observable<boolean> = this.isUpdatingSubject.asObservable();

  private mismatchedEPCsSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /* Remaining picking qty required for selected list item */
  private selectedPickingMaxSubject: BehaviorSubject<number> = new BehaviorSubject(undefined);
  public selectedPickingMax$: Observable<number> = this.selectedPickingMaxSubject.asObservable();

  /* For blockchain use */
  private submissionScanItems: IItemInfo[] = [];

  private addSubmissionScanItem(scanItem: IItemInfo): void { this.submissionScanItems.push(scanItem); }
  
  private updateSubmissionScanItemByTagItem(updatedTagItem: IPLTagItem): void {
    const findIdx = this.submissionScanItems.findIndex(item => item.EPC_ID === updatedTagItem.EPC_ID);
    if (findIdx < 0) {
      console.error('[pl-blockchain svc] Unable to find submission scan item to update');
      return;
    }
    const selectedScanItem = this.submissionScanItems[findIdx];
    selectedScanItem['LastBal'] = updatedTagItem['LastBal']; /* Only LastBal value is edited by user */
    this.submissionScanItems[findIdx] = selectedScanItem;
  }

  private updateSubmissionScanItemsByTagItems(updatedTagItems: IPLTagItem[]): void {
    const updatedTagItemEpcs = updatedTagItems.map(item => item.EPC_ID);
    this.submissionScanItems = this.submissionScanItems.filter(item => updatedTagItemEpcs.includes(item.EPC_ID));
  }
  
  get currentSubmissionScanItems(): IItemInfo[] { return this.submissionScanItems; }
    
  constructor(
    private _itsService: ItsServiceService,
    private _refresh: RefreshService,
    private _invalidTagsService: PlInvalidtagsService,
  ) {
    
    this._refresh.refreshToken$
    .pipe(
      takeUntil(this.destroyed$),
      switchMap(() => this._itsService.getLPTValueByKey(IS_M_FULLY_PICKED_SETTING_KEY)),
      filter(value => !!value),
    ).subscribe({
      next: (isMFullyPicked) => {
        this.isMFullyPicked = isMFullyPicked.toLowerCase() === 'yes' ? true : false;
        console.log('[pl-selected-order service] isMFullyPicked', this.isMFullyPicked);
      }
    });

    this._refresh.refreshToken$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => { this.reset(); }
    });

  }

  getMismatchedEPCs(): string[] { return this.mismatchedEPCsSubject.getValue(); }

  reset(): void {
    this.selectedOrderItemSubject.next(undefined);

    this.initialPickedQtys = undefined;
    this.isMFullyPicked = undefined;
    this.destroyed$ = new Subject();
  }

  setSelectedOrderItem(orderItem: IPLOrderItem): void {
    console.log('[pl-selected-order svc] setSelectedOrderItems', orderItem);
    this.setInitialPickingQtys(orderItem);
    this.setInitialRemainingQtys(orderItem);
    this.selectedOrderItemSubject.next(orderItem);
  }

  updateOrderItemOnScan(scannedItems: IItemInfo[], incomingInvalidTags: string[], isMFullyPicked: boolean): void {      
    function isNewScanItem(scanItem: IItemInfo, currentTagItems: IPLTagItem[]): boolean {
      const currentTagItemEPCs = currentTagItems.map(item => item.EPC_ID);
      return currentTagItemEPCs.includes(scanItem.EPC_ID) ? false : true;
    }
    
    const currentSelectedOrderItem = this.getCurrentSelectedOrderItem();
    const mismatchedEPCs: string[] = [];

    /* add tag item to corresponding tagItems */
    for (var i=0; i<scannedItems.length; i++) {
      const sItem = scannedItems[i];

      /* prioritize suffix-based matching over baseId matching */
      // if suffixtype === 'batchno' or 'expirydate', isMatchingScanItem. Else if 'none', isMatchingScanItemByBase
      let listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => PickingListUtils.isMatchingScanItem(listItem, sItem));
      // if (listItemIdx === -1) {
      //   listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => PickingListUtils.isMatchingScanItemByBase(listItem, sItem));
        if (listItemIdx === -1) {
          console.log('Mismatched scan item. Skipping...', sItem.EPC_ID);
          mismatchedEPCs.push(sItem.EPC_ID);
          continue;
        }
      // }

      const required = currentSelectedOrderItem.PickingList[listItemIdx].Qty;
      const currTagItems = currentSelectedOrderItem.PickingList[listItemIdx].TagItems;

      const pastPicked = this.initialPickedQtys[listItemIdx];
      const currentPicked = PickingListUtils.getOverallPickedQtyFromTagItems(currTagItems);
      const overallPicked = pastPicked + currentPicked;

      /* Max. picking qty reached */
      if (overallPicked >= required) {
        console.log('Maximum picking qty reached. Skipping...', sItem);
        continue;
      }

      /* Ignore previously scanned items */
      if (isNewScanItem(sItem, currTagItems) === false) {
        console.log('Scan item detected in tag list. Skipping...', sItem);
        // mismatchedEPCs.push(sItem.EPC_ID);
        continue;
      }

      const newTagItem = PickingListUtils.getNewTagItem(sItem, currentSelectedOrderItem.PickingList[listItemIdx], isMFullyPicked);
      currentSelectedOrderItem.PickingList[listItemIdx].TagItems.push(newTagItem);
      console.log('New tag item added', newTagItem);
      
      this.addSubmissionScanItem(sItem);

      const updatedTagItems = currentSelectedOrderItem.PickingList[listItemIdx].TagItems;
      const newPicked = PickingListUtils.getOverallPickedQtyFromTagItems(updatedTagItems);
      
      /* update values based on updated tagItems */
      currentSelectedOrderItem.PickingList[listItemIdx]._mDetected = PickingListUtils.isMItemDetected(currentSelectedOrderItem.PickingList[listItemIdx].TagItems);
      currentSelectedOrderItem.PickingList[listItemIdx]._picked = newPicked + pastPicked; 
      currentSelectedOrderItem.PickingList[listItemIdx]._remainingQty = PickingListUtils.getUpdatedRemainingQty(currentSelectedOrderItem.PickingList[listItemIdx]);
    }

    console.log('[pl-selectedorder svc] updateOrderItemOnScan currentSelectedOrderItem', currentSelectedOrderItem);
    console.log('[pl-selectedorder svc] updateOrderItemOnScan currentSelectedOrderItem > mismatchedEPCs', mismatchedEPCs);
    this.selectedOrderItemSubject.next(Object.assign({}, currentSelectedOrderItem));

    const allInvalidTags = [... new Set(incomingInvalidTags.concat(mismatchedEPCs))];
    console.log('[pl-selectedorder svc] updateOrderItemOnScan allInvalidTags', allInvalidTags);
    this._invalidTagsService.setInvalidTags(allInvalidTags);

  }

  updateOrderItemOnPickedQtyChange(updatedTagItem: IPLTagItem): void {
    this.updateSubmissionScanItemByTagItem(updatedTagItem);

    const tagID = updatedTagItem._id;
    const currentSelectedOrderItem = this.getCurrentSelectedOrderItem();
    
    const listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => listItem._id === tagID);
    const tagItemIdx = currentSelectedOrderItem.PickingList[listItemIdx].TagItems.findIndex(item => item._id === tagID && item.EPC_ID === updatedTagItem.EPC_ID);  /* one picking list ID to many EPC IDs */

    /* update selected tag item */
    currentSelectedOrderItem.PickingList[listItemIdx].TagItems[tagItemIdx] = updatedTagItem;
    const updatedTagItems = currentSelectedOrderItem.PickingList[listItemIdx].TagItems;
    const pastPicked = this.initialPickedQtys[listItemIdx];

    currentSelectedOrderItem.PickingList[listItemIdx]._picked = PickingListUtils.getOverallPickedQtyFromTagItems(updatedTagItems) + pastPicked;
    currentSelectedOrderItem.PickingList[listItemIdx]._remainingQty = PickingListUtils.getUpdatedRemainingQty(currentSelectedOrderItem.PickingList[listItemIdx]);
    
    console.log('updateOrderItemOnPickedQtyChange currentSelectedOrderItem', currentSelectedOrderItem);
    this.selectedOrderItemSubject.next(currentSelectedOrderItem);
  }

  /* effective only for S-items. M-items are deleted by setting qty to 0 */
  updateOrderItemOnPickedItemDeletion(updatedTagItems: IPLTagItem[], listID: string): void {
    this.updateSubmissionScanItemsByTagItems(updatedTagItems);

    const currentSelectedOrderItem = this.getCurrentSelectedOrderItem();

    const listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => listItem._id === listID);
    if (listItemIdx === -1) {
      console.error('[pl-selected-order svc] updateOrderItemOnPickedItemDeletion error: Unable to find picking list item', currentSelectedOrderItem.PickingList);
    }
    
    /* update selected list item tagItems */
    currentSelectedOrderItem.PickingList[listItemIdx].TagItems = updatedTagItems;
    const pastPicked = this.initialPickedQtys[listItemIdx];
    
    console.log('[pl-selected-order svc] updateOrderItemOnPickedItemDeletion end > overall picked qty', PickingListUtils.getOverallPickedQtyFromTagItems(updatedTagItems));
    currentSelectedOrderItem.PickingList[listItemIdx]._picked = PickingListUtils.getOverallPickedQtyFromTagItems(updatedTagItems) + pastPicked;
    currentSelectedOrderItem.PickingList[listItemIdx]._mDetected = PickingListUtils.isMItemDetected(currentSelectedOrderItem.PickingList[listItemIdx].TagItems);  /* tag list may consist of a mix of M or S items */
    currentSelectedOrderItem.PickingList[listItemIdx]._remainingQty = PickingListUtils.getUpdatedRemainingQty(currentSelectedOrderItem.PickingList[listItemIdx]);
    
    console.log('[pl-selected-order svc] updateOrderItemOnPickedItemDeletion currentSelectedOrderItem', currentSelectedOrderItem);
    this.selectedOrderItemSubject.next(currentSelectedOrderItem);
  }

  getTagItemPickingMax(selectedTagItem: IPLTagItem): number {
    const currentSelectedOrderItem = this.getCurrentSelectedOrderItem();

    const selectedTagID =  selectedTagItem._id;
    const listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => listItem._id === selectedTagID);
    const selectedTagList = currentSelectedOrderItem.PickingList[listItemIdx].TagItems;

    const pastPicked = this.initialPickedQtys[listItemIdx];
    const otherTagItems = selectedTagList.filter(item => item.EPC_ID !== selectedTagItem.EPC_ID);
    const picked = otherTagItems.reduce((total, item) => total + item._picked, 0) + pastPicked;
    const selectedPickingMax = currentSelectedOrderItem.PickingList[listItemIdx].Qty - picked;  
    return selectedPickingMax;
  }

  getTagItemInitialRemainingQty(selectedTagItemID: string): number {
    const currentSelectedOrderItem = this.getCurrentSelectedOrderItem();

    const listItemIdx = currentSelectedOrderItem.PickingList.findIndex(listItem => listItem._id === selectedTagItemID);
    return this.initialRemainingQtys[listItemIdx];
  }

  private getCurrentSelectedOrderItem(): IPLOrderItem {
    return this.selectedOrderItemSubject.getValue();
  }

  private setInitialPickingQtys(orderItem: IPLOrderItem): void {
    this.initialPickedQtys = !!orderItem ? orderItem.PickingList.map(pickingLine => pickingLine._picked) : [];
    Object.freeze(this.initialPickedQtys);
  }

  private setInitialRemainingQtys(orderItem: IPLOrderItem): void {
    this.initialRemainingQtys = !!orderItem ? orderItem.PickingList.map(pickingLine => pickingLine._remainingQty) : [];
    Object.freeze(this.initialRemainingQtys);
  }

  destroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  init(): void { this.destroyed$ = new Subject(); }
}

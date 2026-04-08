import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { STStatus } from '../stocktaking.constants';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { forkJoin, map, Observable, of } from 'rxjs';
import { STFilters } from '@its/shared/interfaces/frontend/STFilters';
import * as _ from 'lodash';
import { StUtilsService } from './st-utils.service';
import { ICategory } from '@its/shared/interfaces/backend/Category';
import { StFiltersStoreService } from './st-filters-store.service';

const stItemTemplate: ISTItem = {
  "Stock_Taking_Item_ID": undefined,
  "Display_ID": undefined,
  "Creator": undefined,
  "Creation_Time": undefined,
  "Edit_Time": undefined,
  "Status": undefined,
  "Category": undefined,
  "Asset_ID": undefined,
  "EPC_ID": undefined,
  "ItemDescription": undefined,
  "SKU": undefined,
  "PIC": undefined,
  "Ref_No": undefined,
  "St_No": undefined,
  "STDescription": undefined,
  "Date": undefined,
  "Asset_Location_ID": undefined,
  "Location": undefined,
  "Prev_Bal": undefined,
  "Current_Bal": undefined,
  "Balance": undefined,
  "ST_Qty": undefined,
  "Remarks": undefined,
  "SM": undefined,
  "Asset_No": undefined,
}

const itsToSTDictionary = {
  "Asset_LocationLocation": "Location",
  "Asset_StatusName": "Status",
  "LastBal": "Prev_Bal",
  "IsIndividual": "SM",
}

@Injectable({
  providedIn: 'root'
})
export class StStatusService {

  selectedFilters: STFilters;
  stList$: Observable<ISTItem[]>;

  itsSystemList: IItemInfo[]; itsEPCIds: string[]; /* items in its system */
  stList: ISTItem[]; stEPCIds: string[];  /* items in all stocktaking lists */
  userSTList: ISTItem[]; userEPCIds: string[]; /* items in user's stocktaking list */
  userCategories: ICategory[]; userCatNames: string[]; /* categories accessible by user */

  constructor ( 
    private _itsService: ItsServiceService,
    private _stutilsService: StUtilsService,
    private _stfiltersServices: StFiltersStoreService,
  ){}

  processListWithTags(loadedList: ISTItem[], tagsList: string[]): Observable<ISTItem[]> {
    if (!tagsList || tagsList.length <= 0) { 
      console.log('No scanned items to process'); 
      return of([]);
    }

    this.selectedFilters = this._stfiltersServices.storedSelectedFilters;
    const selectedStNo = this.selectedFilters.St_No;
    const stList$ = this._itsService.getStockTakingItem(selectedStNo);

    const userList$ = this._itsService.getSTItemByUsername(selectedStNo);
    const userCats$ = this._itsService.getAssignedUserCategoriesByUserName();

    const tagParams: {"EPC_ID": string}[] = tagsList.map(id => { return { "EPC_ID": id }; });
    const itsList$ = this._itsService.postItemsByEpcId(tagParams).pipe(
      map(itemList => { return itemList.filter(item => item.Asset_StatusName.toLowerCase() === 'available'); })
    );

    const lists$ = forkJoin({ 
      stList: stList$,
      userList: userList$,
      userCats: userCats$,
      itsList: itsList$,
    });

    return lists$.pipe(
      map(values => {
        console.log('[st-status svc] processListWithTags > lists', values);

        this.stList = values.stList;
        this.stEPCIds = this.stList.map(x => x.EPC_ID);

        this.userSTList = values.userList;
        this.userEPCIds = this.userSTList.map(x => x.EPC_ID);

        this.userCategories = values.userCats;
        this.userCatNames = this.userCategories.map(x => x.Name);

        this.itsSystemList = values.itsList;
        this.itsEPCIds = this.itsSystemList.map(x => x.EPC_ID);

        const scannedSTItems: ISTItem[] = [];
        const submittedFoundEPCs = this.userSTList.filter(item => item.Status === STStatus.Found).map(item => item.EPC_ID);
        tagsList.forEach(tag => {
          if (submittedFoundEPCs.includes(tag)) {
            return;
          }
          const processedItem = this.updateScannedItemStatus(tag);
          scannedSTItems.push(processedItem);
        });

        const returnList = loadedList;
        scannedSTItems.forEach((scannedItem) => {
          const findIdx = returnList.findIndex(loadedItem => loadedItem.EPC_ID === scannedItem.EPC_ID);
          if (findIdx === -1) { returnList.push(scannedItem); }
          else { returnList[findIdx] = scannedItem; } 
        });

        return returnList;
      })
    )
  }

  private updateScannedItemStatus(itemEPCId: string): ISTItem { 
    let item: ISTItem = Object.assign({}, stItemTemplate);
    item.EPC_ID = itemEPCId;

    function getInitSTItemQty(stItem: ISTItem): number {
      return stItem.SM.toLowerCase() === 'm' ? null : 1;
    }

    /* not registered check */ 
    if (!this.itsEPCIds.includes(itemEPCId)) { 
      item.Status = STStatus.NotRegistered; 
      console.log(itemEPCId, 'not registered');
      return item;
    }

    /*** ---> item is in ITS */

    /* excess check (st_qty not needed) */
    if (!this.stEPCIds.includes(itemEPCId)) {
      const itemITSInfo = this.itsSystemList.find(item => item.EPC_ID === itemEPCId);
      Object.keys(itsToSTDictionary).forEach(itsKey => {
        itemITSInfo[itsToSTDictionary[itsKey]] = itemITSInfo[itsKey];
        delete itemITSInfo[itsKey];
      });
      item = Object.assign(item, itemITSInfo);
      item.Status = STStatus.Excess;
      console.log(itemEPCId, 'excess');
      return item;
    }

    /*** ---> item is in ITS system and ST list */
    const itemSTInfo = this.stList.find(item => item.EPC_ID === itemEPCId);

    /* no access check */
    if (!this.userEPCIds.includes(itemEPCId) || !this.selectedFilters.Category.includes(itemSTInfo.Category) || !this.userCatNames.includes(itemSTInfo.Category)) {
      item = Object.assign(item, itemSTInfo);
      item.Status = STStatus.NoAccess;
      console.log(itemEPCId, 'no access');
      return item;
    }

    /*** ---> item is in user ST list and selectedFilters.Category includes item.Category */ 
    const itemUserSTInfo = this.userSTList.find(item => item.EPC_ID === itemEPCId);
    item = Object.assign(item, itemUserSTInfo); /* update with st info */

    /* misplaced check */
    if (!this.selectedFilters.Location.includes(item.Location)) { 
      item.Status = STStatus.Misplaced;
      item.ST_Qty = getInitSTItemQty(item);

      item.Asset_Location_ID = this._stutilsService.getSelectedLocationID();

      console.log(itemEPCId, 'misplaced');
      return item; 
    }

    /*** ---> item is in one of selection locations */
    
    /*** assign default status -- found */
    if (this.selectedFilters.Location.includes(item.Location)){
      item.Status = STStatus.Found;
      item.ST_Qty = getInitSTItemQty(item);
      console.log(itemEPCId, 'found');
      return item;
    }

    console.log('No status update for item', item);
    return item;
  }

}

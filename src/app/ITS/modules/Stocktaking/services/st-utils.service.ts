import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { STFilters } from '@its/shared/interfaces/frontend/STFilters';
import { STStatus, StScanStorageKeys } from '../stocktaking.constants';
import { IOngoingST } from '@its/shared/interfaces/backend/SPT_Doc/OngoingST';
import { STNoListItem } from '@its/shared/interfaces/frontend/STNoListItem';
import { StFiltersStoreService } from './st-filters-store.service';

@Injectable({
  providedIn: 'root'
})
export class StUtilsService {

  constructor(
    private _storage: StorageService,
    private _filters: StFiltersStoreService,
  ) { }

  /* FOR SINGLE LOCATION ONLY */
  getSelectedLocationID(): number {
    const selectedLocFilterStr = this._filters.storedLocationStr;
    const selectedLocFilter: { value: string, label: string } = JSON.parse(selectedLocFilterStr)[0];
    const selectedLocFilterID = parseInt(selectedLocFilter.value);
    return selectedLocFilterID;
  }

  ongoingSTByUsernameToStNoList(ongoingStList: IOngoingST[]): STNoListItem[] {
    const stNosData = ongoingStList.map(x => x.St_No);
    const stNoList = [];
    stNosData.forEach((stNo) => { stNoList.push( { stNo: stNo, stId: stNo }); });
    return stNoList;
  }

  isSubmittedItem(item: ISTItem): boolean { /* is a non-pending item from db -- includes misplaced, pending, found items */
    return (!!item.Date) && (!!item.STDescription) && (item.STDescription !== '') && (typeof(item.ST_Qty) === 'number');
  }

  isNonSubmittedItem(item: ISTItem | any): boolean {  /* null and '' checks for db items, undefined checks for scanned items */
    return !this.isSubmittedItem(item);
  }

  isPendingItem(item: ISTItem): boolean { /* pending status item from database */
    return !this.isSubmittedItem(item) && item.Status == STStatus.Pending;
  }

  getPendingList(itemList: ISTItem[]): ISTItem[] {
    return itemList.filter(item => this.isPendingItem(item));
  }

  resetStScanPageStorage(): void {
    this._storage.setItem(StScanStorageKeys.foundItemsLoaded, "false");
    this._storage.removeItem(StScanStorageKeys.postSTItems);
    this._storage.setItem(StScanStorageKeys.postUpdateItemsLoc, "false");
  }
  
  getListBySelectedFilters(inputList: ISTItem[]) { /* exclude filters used to determine item status */
  console.log('[st-utils svc] getListBySelectedFilters inputList', inputList);

    const selectedFilters: STFilters = this._filters.storedSelectedFilters;
    console.log('[st-utils svc] getListBySelectedFilters selectedFilters', selectedFilters);
    
    function filterItem(item: ISTItem): boolean {
      const filterQuery = (field: string) => {
        return !item[field] || (selectedFilters[field].includes(item[field])) || item[field].length === 0;
      };
      return filterQuery('Ref_No') && filterQuery('Category') && filterQuery('Location') && filterQuery('PIC');
    }

    let filteredList: ISTItem[] = inputList.filter(item => filterItem(item));
    return filteredList;
  }

  getSTListBySTStatus(allItems: ISTItem[], filterBy: STStatus): ISTItem[] {
    const list = allItems.length > 0 ?
                  allItems.filter(item => item.Status === filterBy) :
                  [];
    return list;
  }
}

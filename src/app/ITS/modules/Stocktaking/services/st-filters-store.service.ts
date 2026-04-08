import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { StDetailsStorageKeys } from '../stocktaking.constants';
import { STFilters } from '@its/shared/interfaces/frontend/STFilters';
import { STNoListItem } from '@its/shared/interfaces/frontend/STNoListItem';
import { ToastService } from '@dis/services/message/toast.service';
import { StorageServiceItem } from '@its/shared/interfaces/frontend/StorageServiceItem';
import { DataItem } from '@progress/kendo-angular-grid';

@Injectable({
  providedIn: 'root'
})
export class StFiltersStoreService {

  constructor(
    private _storage: StorageService,
    private _toast: ToastService,
  ) { }
  
  get storedLocationStr(): string { return this._storage.getItem(StDetailsStorageKeys.selectedLocs) || ""; }
  get selectedLocations(): string[] {
    const selectedLocsVal = this._storage.getItem(StDetailsStorageKeys.selectedLocs);
    if (this._storage.isItemUndefined(selectedLocsVal)) {
      this._toast.error('No selected locations found.');
      console.error('No selected locations data found in local storage. Error in st-details page.');
      return;
    }
    const selectedLocItems = JSON.parse(selectedLocsVal) as StorageServiceItem[];
    const selectedLocLabels = selectedLocItems.map(loc => loc.label);
    return selectedLocLabels;
  } 

  get storedStIdStr(): string { return this._storage.getItem(StDetailsStorageKeys.selectedStId) || ""; }
  get storedSelectedStNo(): string {
    const storedStNoListItem: STNoListItem = JSON.parse(this.storedStIdStr) as STNoListItem;
    return storedStNoListItem['stNo'];
  }

  get storedSelectedFilters(): STFilters {
    const stNoDataStr = this._storage.getItem(StDetailsStorageKeys.selectedStId);
    const catDataStr = this._storage.getItem(StDetailsStorageKeys.selectedCats);
    const locDataStr = this._storage.getItem(StDetailsStorageKeys.selectedLocs);
    const picDataStr = this._storage.getItem(StDetailsStorageKeys.selectedPICs);
    const refNoDataStr = this._storage.getItem(StDetailsStorageKeys.selectedRefNo);

    if ( this._storage.itemIsUndefinedOrEmpty(stNoDataStr) || this._storage.itemIsUndefinedOrEmpty(locDataStr) ){
      alert('Missing required selection parameters detected');
      return;
    }

    /* modify selection filter comparison values here */
    const stNoData: string = JSON.parse(stNoDataStr)["stNo"];
    const catDataArr: string[] = this._storage.itemIsUndefinedOrEmpty(catDataStr) ? [] : JSON.parse(catDataStr).map(x => x.value);
    const locDataArr: string[] = JSON.parse(locDataStr).map((x: { label: any }) => x.label);
    const picDataArr: string[] = this._storage.itemIsUndefinedOrEmpty(picDataStr) ? [] : JSON.parse(picDataStr).map(x => x.value);
    const refNoDataArr: string[] = this._storage.itemIsUndefinedOrEmpty(refNoDataStr) ? [] : JSON.parse(refNoDataStr).map(x => x.value);

    const selectedFilters: STFilters = {
      St_No: stNoData,
      Category: catDataArr,
      Location: locDataArr,
      PIC: picDataArr,
      Ref_No: refNoDataArr,
    };

    return selectedFilters;
  }

  updateStoredSelectedStId(stNoListItem: STNoListItem) {
    this._storage.setItem(StDetailsStorageKeys.selectedStId, JSON.stringify(stNoListItem));
  }

  updateStoredFiltersIfUndefined(storageKey: string, dataStr: string) {
    const storedData = this._storage.getItem(storageKey);
    if (!storedData || storedData.length === 0) {
      this._storage.setItem(storageKey, dataStr);
    }
  }

  clearAllStoredFilters() {
    this._storage.removeItem(StDetailsStorageKeys.selectedStId);
    this._storage.removeItem(StDetailsStorageKeys.selectedCats);
    this._storage.removeItem(StDetailsStorageKeys.selectedLocs);
    this._storage.removeItem(StDetailsStorageKeys.selectedPICs);
    this._storage.removeItem(StDetailsStorageKeys.selectedRefNo);
  }

}

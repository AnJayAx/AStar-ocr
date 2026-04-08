import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { STNoListItem } from '@its/shared/interfaces/frontend/STNoListItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import {  map, Observable, switchMap } from 'rxjs';
import { DISPLAY_STBAL_SETTING_KEY, StScanStorageKeys } from '../stocktaking.constants';
import { StUtilsService } from './st-utils.service';
import { StFiltersStoreService } from './st-filters-store.service';
import { RefreshService } from '@its/shared/services/refresh.service';

const LFI_KEY = StScanStorageKeys.foundItemsLoaded;
@Injectable({
  providedIn: 'root'
})
export class StSettingsService {

  stNoList$: Observable<STNoListItem[]> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getOngoingSTByUsername()),
    map(ongoingST => this._stutilsService.ongoingSTByUsernameToStNoList(ongoingST))
  );

  constructor(
    private _storage: StorageService,
    private _itsService: ItsServiceService,
    private _stutilsService: StUtilsService,
    private _stfilters: StFiltersStoreService,
    private _refresh: RefreshService,
  ) {}

  getStoredSelectedStNoListItem(loadedStListItems: STNoListItem[]): STNoListItem {
    function isValidStNo(validStNos: string[], stNo: string): boolean {
      return validStNos.includes(stNo);
    }

    const storedData = this._stfilters.storedStIdStr;
    if (this._storage.itemIsUndefinedOrEmpty(storedData)) {
      return null;
    }
    
    const validStNos = loadedStListItems.map(x => x.stNo);
    const storedStNo: string = JSON.parse(storedData).stNo;
    if (!isValidStNo(validStNos, storedStNo)) {
      return null;
    }

    return JSON.parse(storedData);
  }

  getLoadFoundItems(): boolean {
    if (this._storage.isItemUndefined(this._storage.getItem(LFI_KEY))) {
      console.log('[st-settings svc] loadFoundItem is undefined. Returning default value.');
      return false;
    }
    return this._storage.getStoredBoolean(this._storage.getItem(LFI_KEY));
  }

  setLoadFoundItems(isFoundItemsLoaded: boolean): void {
    const saveLFIVal = isFoundItemsLoaded === true ? 'true' : 'false';
    this._storage.setItem(LFI_KEY, saveLFIVal);
  }

  setDefaultUpdateItemsLoc(): void {
    this._storage.setItem(StScanStorageKeys.postUpdateItemsLoc, 'false');
  }

  setUpdateItemsLoc(updateItemLocation: boolean): void {
    const data = updateItemLocation ? 'true' : 'false';
    this._storage.setItem(StScanStorageKeys.postUpdateItemsLoc, data);
  }

  getUpdateItemsLoc(): boolean {
    const savedData = this._storage.getItem(StScanStorageKeys.postUpdateItemsLoc);
    if (this._storage.itemIsUndefinedOrEmpty(savedData)) {
      this.setDefaultUpdateItemsLoc();
      return false;
    }
    const uil = savedData.toLowerCase() === 'true' ? true : false;
    return uil;
  }

  getDisplaySTBalSetting(): Observable<boolean> {  
    return this._itsService.getITSSettingByKey(DISPLAY_STBAL_SETTING_KEY).pipe(
      map(res => res[0].ITSValue.toLowerCase()),
      map(s => s?.toLowerCase() === 'yes' ? true: false)
    );
  }
}

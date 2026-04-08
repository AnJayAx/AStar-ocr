import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { StorageServiceItem } from '@its/shared/interfaces/frontend/StorageServiceItem';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupSelectionService {  

  constructor(
    private _storage: StorageService,
  ) {}

  getSelections(key: string): StorageServiceItem[] {
    const storedData = this._storage.getItem(key);
    if (this._storage.itemIsUndefinedOrEmpty(storedData)) {
      return [];
    }
    return JSON.parse(storedData);
  }

  setSelections(key: string, data: StorageServiceItem[]|DataItem[]): void {
    console.log(`[popup-selection svc] setSelections`, key);
    const storedData = this._storage.getItem(key);
    if (this._storage.isItemUndefined(storedData)) {
      console.log(`[popup-selection svc] setting data`, data);
      if (data.length <= 0) { this._storage.setEmptyItem(key); }
      else { this._storage.setItem(key, JSON.stringify(data)); }
    } else {
      console.log(`[popup-selection svc] item is not undefined`, key);
    }
  }

}

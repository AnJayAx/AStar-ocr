import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Injectable({
  providedIn: 'root'
})
export class SmStoreService {

  private mergeToItem: IItemInfo;
  private mergeFromItems: IItemInfo[];

  constructor() { }

  setMergeToItem(item: IItemInfo): void { this.mergeToItem = item; }
  getMergeToItem(): IItemInfo { return this.mergeToItem; }

  setMergeFromItems(items: IItemInfo[]): void { this.mergeFromItems = items; }
  getMergeFromItems(): IItemInfo[] { return this.mergeFromItems; }

  clearStore(): void {
    this.mergeToItem = null;
    this.mergeFromItems = null;
  }
}

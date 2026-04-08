import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateTagidStoreService { 
  
  showUpdateDialog$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  keyword$: BehaviorSubject<string> = new BehaviorSubject(null); 
  itemInfoList$: BehaviorSubject<IItemInfo[]> = new BehaviorSubject([]); /* user-searched list */
  selectedItem$: BehaviorSubject<IItemInfo> = new BehaviorSubject(null);
  scannedTag$: BehaviorSubject<string> = new BehaviorSubject(null);
  updateTagId$: BehaviorSubject<string> = new BehaviorSubject(null);
  showErrorMsg$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  errorMsg$: BehaviorSubject<string> = new BehaviorSubject(null);
  
  constructor() {}

  get loadState$() {
    return combineLatest({
      showUpdateDialog: this.showUpdateDialog$.asObservable(),
      keyword: this.keyword$.asObservable(),
      itemInfoList: this.itemInfoList$.asObservable(),
      selectedItem: this.selectedItem$.asObservable(),
      scannedTag: this.scannedTag$.asObservable(),
      updateTag: this.updateTagId$.asObservable(),
      showErrorMsg: this.showErrorMsg$.asObservable(),
      errorMsg: this.errorMsg$.asObservable()
    });
  }

  setScannedTag(tag: string): void {
    this.scannedTag$.next(tag);
  }

  setKeyword(keyword: string): void {
    this.keyword$.next(keyword);
  }

  setSelectedItem(item: IItemInfo): void {
    this.selectedItem$.next(item);
  }
  
  setItemInfoList(itemInfos: IItemInfo[]): void {
    this.itemInfoList$.next(itemInfos);
  }

  setUpdateTagId(tag: string): void {
    this.updateTagId$.next(tag);
  }

  setShowUpdateDialog(isShown: boolean): void {
    this.showUpdateDialog$.next(isShown);
  }

  setShowErrorMsg(isShown: boolean): void {
    this.showErrorMsg$.next(isShown);
  }

  setErrorMsg(message: string): void {
    this.errorMsg$.next(message);
  }

  resetUpdateTagIdStore(): void {
    this.setShowUpdateDialog(false);
    this.setKeyword('');
    this.setItemInfoList([]);
    this.setSelectedItem(null);
    this.setScannedTag(null);
    this.setUpdateTagId(null);
    this.setShowErrorMsg(false);
    this.setErrorMsg(undefined);
  }

}

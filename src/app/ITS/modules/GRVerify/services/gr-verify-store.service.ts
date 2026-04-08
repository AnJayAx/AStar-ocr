import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { BehaviorSubject, Observable, combineLatest, forkJoin } from 'rxjs';
import { SearchKeyType } from '../gr-verify.constants';

@Injectable({
  providedIn: 'root'
})
export class GrVerifyStoreService { 

  private searchKeyword$: BehaviorSubject<string> = new BehaviorSubject('');
  searchKeywordState$: Observable<string> = this.searchKeyword$.asObservable();
  private searchKeyType$: BehaviorSubject<SearchKeyType> = new BehaviorSubject(SearchKeyType.BatchNo);
  searchKeyTypeState$: Observable<SearchKeyType> = this.searchKeyType$.asObservable();
  private itemInfoList$: BehaviorSubject<IItemInfo[]> = new BehaviorSubject([]);
  itemInfoListState$: Observable<IItemInfo[]> = this.itemInfoList$.asObservable();
  private foundItemList$: BehaviorSubject<IItemInfo[]> = new BehaviorSubject([]);
  foundItemListState$: Observable<IItemInfo[]> = this.foundItemList$.asObservable();
  
  constructor() { }

  get loadState$() {
    return forkJoin({
      searchKeyword: this.searchKeywordState$,
      searchKeyType: this.searchKeyTypeState$,
      itemInfoList: this.itemInfoListState$,
      foundItemList: this.foundItemListState$
    });
  }

  get latestState$() {
    return combineLatest({
      searchKeyword: this.searchKeywordState$,
      searchKeyType: this.searchKeyTypeState$,
      itemInfoList: this.itemInfoListState$,
      foundItemList: this.foundItemListState$
    });
  }

  setsearchKeyword(batchNo: string) { this.searchKeyword$.next(batchNo); }
  setSearchKeyType(searchKeyType: SearchKeyType) { this.searchKeyType$.next(searchKeyType); }
  setItemInfoList(list: IItemInfo[]) { this.itemInfoList$.next(list); }
  setFoundItemList(list: IItemInfo[]) { this.foundItemList$.next(list); }

  get searchKeyword(): string { return this.searchKeyword$.getValue(); }
  get searchKeyType(): SearchKeyType { return this.searchKeyType$.getValue(); }
  get itemInfoList(): IItemInfo[] { return this.itemInfoList$.getValue(); }
  get foundItemList(): IItemInfo[] { return this.foundItemList$.getValue(); }

  resetStore(): void {
    this.searchKeyword$.next('');
    this.itemInfoList$.next([]);
    this.foundItemList$.next([]);
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, BehaviorSubject, Subject, takeUntil, map, switchMap, tap } from 'rxjs';
import { ScanViewInvalidTagsService } from './scan-view-invalid-tags.service';

@Injectable({
  providedIn: 'root'
})
export class ScanViewService implements OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  private productLotNoSource = new BehaviorSubject<string>('');
  currentProductLotNo = this.productLotNoSource.asObservable();
  private itemInfoListSubject: BehaviorSubject<IItemInfo[]> = new BehaviorSubject([]);
  private selectedItemInfoListSubject: BehaviorSubject<IItemInfo[]> = new BehaviorSubject(undefined);

  constructor(
    private _tagsService: ScannedTagsService,
    private _itsService: ItsServiceService,
    private _commondata: CommonDataService,
    private _invalidtagsService: ScanViewInvalidTagsService,
  ) {
    this._tagsService.scannedTags$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (tags) => {
        if (!tags || tags.length <= 0) { this.clearItemInfoLists(); }
      },
      error: (error) => { console.error(error); }
    });
  }

  private getItemInfoByEPC(scanTags: string[], productLotNo): Observable<IItemInfo[]> {
    const tagParams = scanTags.map(tag => { return { "EPC_ID": tag}; });
    console.log("product lotno 2 = " + productLotNo );
    return this._itsService.postItemsByEpcIdLotNo(tagParams, productLotNo);
    //return this._itsService.postItemsByEpcId(tagParams);
  }

  get storedItemInfoList(): IItemInfo[] { return this.itemInfoListSubject.getValue(); }

  getFilteredItemInfoByEPC(scanTags: string[], productLotNo): Observable<IItemInfo[]> {
    let registeredEPCs: string[];
    console.log("product lotno 1= " + productLotNo );
    return this._commondata.validCategoryNames$.pipe(
      switchMap(validCategories => {
        return this.getItemInfoByEPC(scanTags, productLotNo).pipe(
          /* Process invalid tags */
          tap(registeredItems => registeredEPCs = registeredItems.map(item => item.EPC_ID)),
          tap(items => this._invalidtagsService.appendInvalidCategoryTags(items.filter(item => !validCategories.includes(item.Category)))),
          map(items => { return items.filter(item => validCategories.includes(item.Category)); }),
        );
      })
    );
  }

  updateProductLotNo(lotNo: string) {
    this.productLotNoSource.next(lotNo);
  }

  getItemInfoList(): Observable<IItemInfo[]> {
    return this.itemInfoListSubject.asObservable();
  }

  setItemInfoList(updatedlist: IItemInfo[]) {
    this.itemInfoListSubject.next(updatedlist);
  }

  getSelectedItemInfoList(): Observable<IItemInfo[]> {
    return this.selectedItemInfoListSubject.asObservable();
  }

  setSelectedItemInfoList(updatedlist: IItemInfo[]) {
    this.selectedItemInfoListSubject.next(updatedlist);
  }

  isCheckedItem(scanItem: IItemInfo): Observable<boolean>{
    return this.selectedItemInfoListSubject.pipe(
      map(selectedItems => selectedItems.map(item => item.EPC_ID).includes(scanItem.EPC_ID))
    );    
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    this.clearItemInfoLists();
  }

  clearItemInfoLists() {
    this.itemInfoListSubject.next([]);
    this.selectedItemInfoListSubject.next([]);
  }
}

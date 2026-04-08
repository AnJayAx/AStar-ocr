import { Injectable, OnDestroy } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { StorageService } from '@dis/services/storage/storage.service';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { BehaviorSubject, Observable, switchMap, tap, filter, map } from 'rxjs';
import { StScanStorageKeys, STStatus } from '../stocktaking.constants';
import { StSettingsService } from './st-settings.service';
import { StStatusService } from './st-status.service';
import { StUtilsService } from './st-utils.service';
import { StFiltersStoreService } from './st-filters-store.service';

@Injectable({
  providedIn: 'root'
})
export class StListService implements OnDestroy {

  private currentScannedTags: string[] = []; 
  
  private defaultList: ISTItem[] = []; /* database list, with found items included */
  private defaultListSubject: BehaviorSubject<ISTItem[]> = new BehaviorSubject(this.defaultList);
  public defaultList$: Observable<ISTItem[]> = this.defaultListSubject.asObservable();

  private workingSTListSubject: BehaviorSubject<ISTItem[]> = new BehaviorSubject([]);
  public workingSTList$: Observable<ISTItem[]> = this.workingSTListSubject.asObservable();

  constructor(
    private _storage: StorageService,
    private _itsService: ItsServiceService,
    private _toast: ToastService,
    private _stsettingsService: StSettingsService,
    private _stutilsService: StUtilsService,
    private _tagsService: ScannedTagsService,
    private _ststatusService: StStatusService,
    private _stfiltersService: StFiltersStoreService,
  ){
    const currList = this.getWorkingStListFromStore() || [];
    this.workingSTListSubject.next(currList);
  }

  initDefaultList(): Observable<boolean> {
    const isInitialized$ = new BehaviorSubject<boolean>(false);
    const selectedStNo = this._stfiltersService.storedSelectedStNo;
    const getSTDefaultList$: Observable<ISTItem[]> = this._itsService.getSTItemByUsername(selectedStNo).pipe(
      map(itsListByUsername => {
        let returnList = [];

        function isDefaultStocktakeListItem(item: ISTItem): boolean {
          return item.Status === STStatus.Pending || item.Status === STStatus.Found
        }

        returnList = itsListByUsername.filter(item => isDefaultStocktakeListItem(item));
        returnList = this._stutilsService.getListBySelectedFilters(returnList);
        return returnList;
      })
    );

    getSTDefaultList$.subscribe({
      next: (defaultList) => {
        this.defaultList = defaultList;
        this.defaultListSubject.next(this.defaultList);

        this.setDefaultList();
        isInitialized$.next(true);
      }
    });

    return isInitialized$.asObservable();
  }

  setDefaultList(): void {
    const inclSubmittedItems = this._stsettingsService.getLoadFoundItems();
    this.currentScannedTags = [];
    const currList = inclSubmittedItems ? this.defaultList : this.defaultList.filter(item => this._stutilsService.isPendingItem(item));
    
    this.workingSTListSubject.next(currList);
    this.storeCurrentWorkingStList();
    console.log('[st-list svc] setDefaultList', currList);
  }

  tagsCleared$: Observable<boolean> = this._tagsService.tagsCleared$.pipe(
    filter(isCleared => isCleared),
    tap(() => {
      console.log('[st-list svc] tagsCleared. Clearing current scanned tags and setting default list')
      this.currentScannedTags = [];
      this.setDefaultList();
    }),
  );

  newScan$: Observable<boolean> = this._tagsService.scannedTags$.pipe(
    filter(tags => tags.length>0 && this.isIncomingTagsNew(tags)===true),
    tap(tags => {
      this.currentScannedTags = tags;
      console.log('[st-list svc] st-list svc currentScannedTags updated.', this.currentScannedTags);
    }),
    switchMap(tags => { return this._ststatusService.processListWithTags(this.workingSTListSubject.getValue(), tags) }),
    tap(processedList => {
      if (processedList.length > 0) {
        this.workingSTListSubject.next(processedList);
        this.storeCurrentWorkingStList();
        console.log('[st-list svc] Updated working list upon new scan', processedList);
      }
    }),
    map(() => true)
  );

  editSTItem(updatedItem: ISTItem): void {
    console.log('[st-list svc] editSTItem updatedItem', updatedItem);
    let currList = this.workingSTListSubject.getValue();
    const findIdx = currList.findIndex(item => item.EPC_ID.toLowerCase() === updatedItem.EPC_ID.toLowerCase());
    if (findIdx === -1) {
      this._toast.error('Error occurred while updating item');
      return;
    }

    currList[findIdx] = updatedItem;
    this.workingSTListSubject.next(currList);
    
    this.storeCurrentWorkingStList();
  }

  removeSTItem(removedItem: ISTItem): void {
    let currList = this.workingSTListSubject.getValue();
    const findIdx = currList.findIndex(item => item.EPC_ID.toLowerCase() === removedItem.EPC_ID.toLowerCase());
    if (findIdx === -1) {
      this._toast.error('Error occurred while deleting item');
      return;
    }

    currList.splice(findIdx, 1);
    this.workingSTListSubject.next(currList);
    
    this.storeCurrentWorkingStList();
  }

  onLoadFoundChange(foundItemsLoaded: boolean): void { /* add submitted items from database to current list */
    const submittedFoundItems = this.defaultList.filter(item => item.Status == STStatus.Found && this._stutilsService.isSubmittedItem(item));
    let currList = this.workingSTListSubject.getValue();
    if (foundItemsLoaded) {
      currList = currList.concat(submittedFoundItems);
    } else {
      currList = currList.filter(item => this._stutilsService.isNonSubmittedItem(item));
    }
    
    this.workingSTListSubject.next(currList);
    this.storeCurrentWorkingStList();
    
    console.log('[st-list svc] onLoadFoundChange', currList);

    if (foundItemsLoaded && submittedFoundItems.length > 0) {
      this._toast.success('Found items added.');
    } else if (foundItemsLoaded && submittedFoundItems.length == 0) {
      this._toast.info('No previous found items detected.');
    } else {
      this._toast.info('Found items removed.');
    }
  }

  private isIncomingTagsNew(incomingTags: string[]): boolean {
    if (this.currentScannedTags.length == 0) {
      return true;
    }

    let isNew = false;
    incomingTags.forEach(tag => {
      const included = this.currentScannedTags.includes(tag);
      if (included === false) {
        isNew = true;
        return;
      }
    });
    return isNew;
  }
  
  private storeCurrentWorkingStList() {
    const key = StScanStorageKeys.postSTItems;
    const saveVal = JSON.stringify(this.workingSTListSubject.getValue());
    this._storage.setItem(key, saveVal);
  }

  private getWorkingStListFromStore(): ISTItem[] {
    const key = StScanStorageKeys.postSTItems;
    const list = JSON.parse(this._storage.getItem(key));
    return !!list ? list as ISTItem[] : [];
  }

  ngOnDestroy(): void {
    console.log('[st-list svc] DESTROYED');
  }
}

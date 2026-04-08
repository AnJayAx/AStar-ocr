import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, filter, from, map, switchMap, takeUntil, tap } from 'rxjs';
import { PagerSettings } from '@progress/kendo-angular-listview/main';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { ToastService } from '@dis/services/message/toast.service';
import { Router } from '@angular/router';
import { LocationBarService } from '../location-bar.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';
import RFIDPlugin from '@its/shared/interfaces/plugins/RFIDPlugin';

enum SearchMode {
  RFID = 'rfid',
  Keyword = 'keyword'
}
@Component({
  selector: 'app-loc-search',
  templateUrl: './loc-search.component.html',
  styleUrls: ['./loc-search.component.scss'],
  providers: [LocationBarService]
})
export class LocSearchComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  selectedSearchMode: SearchMode = SearchMode.Keyword;

  @ViewChild('listview') listview;
  public pagerSettings: PagerSettings;
  public pageSize: number;

  keyword: string = '';
  itemInfoList: IItemInfo[] = [];
  selectedItem: IItemInfo;

  constructor(
    private _itsService: ItsServiceService,
    private _toast: ToastService,
    private _router: Router,
    private _locationbarService: LocationBarService,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
    private _rfidService: ScanRfidService,
    private _customDialog: CustomDialogService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Locating', 'mainmenunew');

    //TODO: Disable this block (lines 49-70) to check if locating works on TC22 
    // does NOT work for TC22R

  }

  ngOnInit(): void {
    this._locationbarService.getItemInfoByBatch().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (itemInfos) => {
        this.itemInfoList = itemInfos;
        console.log('[loc-search] get item info by batch', this.itemInfoList);
        this.ref.detectChanges();
      },
      error: (error) => {
        this._toast.error(error);
      }
    });
    
    from(RFIDPlugin.connect({ value: 'Hello World!'})).pipe(
      map(valueObject => { return valueObject['value'] === 'false' ? false : true; }),
      tap(isRfidConnected => console.log('[scan-rfid svc] isRfidReaderConnected$', isRfidConnected))
    )
    .pipe(
      takeUntil(this.destroyed$),
      filter(isConnected => !isConnected),
      switchMap(() => this._customDialog.message(
            'Unable to Detect RFID Reader',
            'Access to the RFID reader is required for locationing',
            [{ text: 'Go Back', primary: true}],
            "error"
          )
      )
    )
    .subscribe({
      next: (dialogResponse) => {
        if (!!dialogResponse) {
          this._router.navigateByUrl('mainmenunew');
        }        
      }
    });

  }

  // toggleSearchMode(selectedMode: SearchMode) {
  //   this.selectedSearchMode = selectedMode;
  //   if (this.selectedSearchMode === SearchMode.Keyword) {
  //     // Do nothing
  //   }
  //   else if (this.selectedSearchMode === SearchMode.RFID) {
  //   }
  //   else {
  //     console.error('Invalid search mode selection detected', selectedMode);
  //   }
  // }

  onClickSearch() {
    // if (this.keyword?.length <= 0) {
    //   this._toast.info('Enter a keyword to proceed');
    //   return;
    // }
    
    this._itsService.getItemInfoByKeyword(this.keyword).pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (itemInfos) => {
        this.itemInfoList = itemInfos;
        if (this.itemInfoList.length <= 0) {
          this._toast.warning(`No results found for "${this.keyword}"`);
        }
      }
    });
  }

  onSelectItem(selectedItem: IItemInfo) {
    this.selectedItem = selectedItem;
    this.ref.detectChanges();
  }

  isSelectedItem(item: IItemInfo) {
    return this.selectedItem?.EPC_ID === item.EPC_ID;
  }

  onClickClear() {
    this.keyword = '';
    this.itemInfoList = [];
    this._locationbarService.clearBatchItemInfo();
  }

  onClickLocate() {
    if (!this.selectedItem) {
      this._toast.info('Select an item to proceed');
      return;
    }
    this._router.navigate(['loc-scan'], {
      queryParams: { epcID: this.selectedItem.EPC_ID }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

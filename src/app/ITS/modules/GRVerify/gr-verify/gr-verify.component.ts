import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ToastService } from '@dis/services/message/toast.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { Subject, distinctUntilChanged, filter, switchMap, take, takeUntil, tap } from 'rxjs';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { faCircleCheck, faKey } from '@fortawesome/free-solid-svg-icons';
import { GrVerifyService } from '../services/gr-verify.service';
import { GrVerifyStoreService } from '../services/gr-verify-store.service';
import { SearchKeyType } from '../gr-verify.constants';


@Component({
  selector: 'app-gr-verify',
  templateUrl: './gr-verify.component.html',
  styleUrls: ['./gr-verify.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GrVerifyComponent implements OnInit, OnDestroy {
  searchKeyIcon = faKey;
  showPopup: boolean = false;
  @ViewChild("searchKeyAnchor", { read: ElementRef }) public searchKeyAnchor: ElementRef;
  @ViewChild("searchKeyPopup", { read: ElementRef }) public searchKeyPopup: ElementRef;
  @HostListener("document:click", ["$event"])
  public documentClick(event: KeyboardEvent): void {
    if (!this.contains(event.target)) {
      this.showPopup = false;
    }
  }
  private contains(target: EventTarget): boolean {
    return (
      this.searchKeyAnchor.nativeElement.contains(target) ||
      (this.searchKeyPopup ? this.searchKeyPopup.nativeElement.contains(target) : false)
    );
  }
  
  private destroyed$: Subject<boolean> = new Subject();
  verifiedIcon = faCircleCheck;
  reloadElemRef: ElementRef = this.elemRef;
  reloadComponent: any = this;
  showSubmissionPanel: boolean = false;

  SearchKeyType = SearchKeyType;
  searchKeyTypes: SearchKeyType[] = [ SearchKeyType.BatchNo, SearchKeyType.RefNo ];
  selectedSearchKeyType: SearchKeyType;
  searchbarPlaceholder: string;
  itemListPlaceholder: string;
  searchKeyword: string = '';
  
  itemInfoList: IItemInfo[] = [];
  foundItemList: IItemInfo[] = [];

  constructor(
    private _toast: ToastService,
    private elemRef: ElementRef,
    private _layoutService: LayoutService,
    private _grverifyService: GrVerifyService,
    private ref: ChangeDetectorRef,
    private _tagsService: ScannedTagsService,
    private _storeService: GrVerifyStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('GR Verify', 'mainmenunew');

    this._storeService.latestState$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe({
      next: (state) => {
        this.searchKeyword = state.searchKeyword;
        this.selectedSearchKeyType = state.searchKeyType;
        this.itemInfoList = state.itemInfoList;
        this.foundItemList = state.foundItemList;
        console.log('[GR-VERIFY] latestState$', state);
      }
    });

    this.searchKeyword = this._storeService.searchKeyword;
    this.selectedSearchKeyType = this._storeService.searchKeyType;
    this.itemInfoList = this._storeService.itemInfoList;
    this.foundItemList = this._storeService.foundItemList;

    this.onSelectedSearchKeyTypeChange(this.selectedSearchKeyType);
  }

  onToggleSearchKeyPopup() {
    this.showPopup = !this.showPopup;
    this.ref.detectChanges();
  }

  ngOnInit(): void {  
    /* generate GR item list */
    this._grverifyService.grVerifyScannedItemSearchKeyValue$(this.itemInfoList.length===0, this.selectedSearchKeyType)
    .pipe(
      filter(searchKeyValue => this.itemInfoList.length===0 && searchKeyValue?.length>0),
      takeUntil(this.destroyed$),
      tap(searchKeyValue => {
        this.searchKeyword = searchKeyValue;
        this._storeService.setsearchKeyword(this.searchKeyword);
      }),
      switchMap(searchKeyValue => this._grverifyService.getGrVerifyItemsBySearchKey$(searchKeyValue, this.selectedSearchKeyType))
    ).subscribe({
      next: (itemArr) => {
        this._storeService.setItemInfoList(itemArr);
        this._storeService.setFoundItemList([]);

        this.itemInfoList = itemArr;
        this.foundItemList = [];

        console.log('[GR-VERIFY] onSearch$ itemInfoList', this.itemInfoList);
        console.log('[GR-VERIFY] onSearch$ foundItemList', this.foundItemList);

        if (this.itemInfoList.length === 0) {
          this._toast.warning(`No items found for Batch No: ${this.searchKeyword}`);
        }
      }
    });

    /* scan for items in GR item list */
    this._tagsService.scannedTags$
    .pipe(
      filter(() => this.itemInfoList.length > 0),
      filter(tags => tags.length > 0),
      takeUntil(this.destroyed$),
    ).subscribe({
      next: (tags) => {  
        if (this.itemInfoList.length > 0) {
          const currentTagIds = this.itemInfoList.map(item => item.EPC_ID);
          const foundTagIds = this.foundItemList.map(item => item.EPC_ID);
          
          tags.forEach(tag => {
            const findIdx = currentTagIds.indexOf(tag);
            if (findIdx >= 0 && !foundTagIds.includes(tag) && this.foundItemList.length<this.itemInfoList.length) {
              this.foundItemList.push(this.itemInfoList[findIdx]);
            }
          });
          this.ref.detectChanges();
          this._storeService.setFoundItemList(this.foundItemList);
        }
        this._tagsService.resetTagsService()
      },
    });
  }

  handleSelectedSearchKeyTypeChange(selectedSearchKeyType: SearchKeyType) {
    this.onSelectedSearchKeyTypeChange(selectedSearchKeyType);
    this._storeService.resetStore();
  }

  onSelectedSearchKeyTypeChange(selectedSearchKeyType: SearchKeyType) {
    this.selectedSearchKeyType = selectedSearchKeyType;
    this._storeService.setSearchKeyType(this.selectedSearchKeyType);
    this.searchbarPlaceholder = this.selectedSearchKeyType === SearchKeyType.BatchNo ? "Search batch number..." : "Search ref number...";
    this.itemListPlaceholder = this.selectedSearchKeyType === SearchKeyType.BatchNo ? "Search or Scan for a Batch Number" : "Search or Scan for a Reference Number";
  }

  showCheckMark(): boolean {
    return this.itemInfoList.length > 0 && this.foundItemList.length === this.itemInfoList.length;
  }

  onClickSearch() {
    if (this.searchKeyword.length <= 0) {
      const printSearchKey: string = this.selectedSearchKeyType === SearchKeyType.BatchNo ? "batch number" : "reference number";
      this._toast.info(`Enter a ${printSearchKey} to proceed`);
      return;
    }
    this._storeService.setsearchKeyword(this.searchKeyword);
  
    this._grverifyService.getGrVerifyItemsBySearchKey$(this.searchKeyword, this.selectedSearchKeyType)
    .pipe(take(1))
    .subscribe({
      next: (itemArr) => {
        this._storeService.setItemInfoList(itemArr);
        this._storeService.setFoundItemList([]);

        this.itemInfoList = itemArr;
        this.foundItemList = [];

        if (this.itemInfoList.length === 0) {
          this._toast.warning(`No items found for ${this.selectedSearchKeyType}: ${this.searchKeyword}`);
        }
      }
    });
  }

  isSelected(dataItem: IItemInfo): boolean {
    return this.foundItemList.map(item => item.EPC_ID).includes(dataItem.EPC_ID);
  }

  onClear(cleared: boolean) {
    if (cleared) {
      this.foundItemList = [];
      this._storeService.setFoundItemList(this.foundItemList);
    }
  }

  onClickReload(clicked: boolean) {
    this.searchKeyword = '';
    this.itemInfoList = [];
    this.foundItemList = [];
    this._storeService.resetStore();
  }

  onClickConfirm(): void {
    this.showSubmissionPanel = true;
    console.log('[GR-VERIFY] postGRVerifyItems', this.foundItemList);
  }

  onCloseSubmission(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      this._grverifyService.postGRVerifyItemsToServerAndBlockchain(this.foundItemList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.primary) {
            this.onClickReload(true);
          }
        }
      });
    } else {
      console.log('GR Verify submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

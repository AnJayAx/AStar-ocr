import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@dis/services/layout/layout.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject, filter, take, takeUntil } from 'rxjs';
import { WriteOffService } from '../services/write-off.service';
import { ToastService } from '@dis/services/message/toast.service';
import { IScrapItem } from '@its/shared/interfaces/frontend/scrapItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { WriteOffStoreService } from '../services/write-off-store.service';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';

@Component({
  selector: 'app-write-off',
  templateUrl: './write-off.component.html',
  styleUrls: ['./write-off.component.scss']
})
export class WriteOffComponent implements OnInit, OnDestroy {
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef = this.elemRef;
  reloadComponent: any = this;

  selectedOrderNo: string = this._store.getSelectedOrderNoState();

  searchInput: string = this._store.getSearchInputState();
  writeOffList: IItemInfo[] = this._store.getWriteOffListState();
  viewWriteOffList: IItemInfo[] = this._store.getViewWriteOffListState();
  confirmedWriteOffList: IItemInfo[] = this._store.getConfirmedWriteOffListState();

  writeOffRemarks: string = '';
  showRemarksPanel: boolean = false;
  showSubmissionPanel: boolean = false;

  constructor(
    private elemRef: ElementRef,
    private _layoutService: LayoutService,
    private _tagsService: ScannedTagsService,
    private _writeoffService: WriteOffService,
    private _toast: ToastService,
    private _itsService: ItsServiceService,
    private _store: WriteOffStoreService,
    private ref: ChangeDetectorRef,
    private _customdialog: CustomDialogService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Write-off', 'mainmenunew');
  }

  ngOnInit(): void {
    this._tagsService.scannedTags$
    .pipe(
      takeUntil(this.destroyed$),
      filter(tags => tags.length > 0 && this.writeOffList?.length > 0),
    )
    .subscribe({
      next: (tags) => {
        const currentTagIds = this.writeOffList.map(item => item.EPC_ID);
        const confirmedTagIds = this.confirmedWriteOffList.map(item => item.EPC_ID);
        tags.forEach(tag => {
          const findIdx = currentTagIds.indexOf(tag);
          if (findIdx >= 0 && !confirmedTagIds.includes(tag) && this.confirmedWriteOffList?.length < this.writeOffList?.length) {
            this.confirmedWriteOffList = [...this.confirmedWriteOffList, this.writeOffList[findIdx]];
          }
        });
        this._tagsService.resetTagsService();
      }
    });
  }

  handleSelectedOrderChange(selectedOrderNo: string) {
    this.selectedOrderNo = selectedOrderNo;

    this._writeoffService.getWriteOffListByDocNo(this.selectedOrderNo)
    .pipe(take(1))
    .subscribe({
      next: (list) => {
        if (list.length > 0) {
          this.writeOffList = list;
          this.viewWriteOffList = this.writeOffList.slice();
          this.confirmedWriteOffList = [];
        } else {
          this._toast.error(`Unable to find list with order number: ${this.selectedOrderNo}`);
        }
      }
    });
  }

  isToWriteOff(item: IItemInfo): boolean {
    return this.confirmedWriteOffList.some(listItem => listItem['EPC_ID'] === item.EPC_ID);
  }

  onDataItemSelect(item: IItemInfo) {
    if (this.isToWriteOff(item)) {
      this._customdialog.message(
        `Remove item`,
        `Undo write off for ${item.Asset_No}?`,
        [{ text: 'Yes', primary: true }, { text: 'No', primary: false }],
        "warning"
      )
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response.primary) {
              this.confirmedWriteOffList = this.confirmedWriteOffList.filter(item => item.EPC_ID !== item.EPC_ID);
            } else {
              console.log('Remove operation cancelled');
            }
            this.ref.detectChanges();
          }
        });
    } else {
      console.log(`${item.Asset_StatusName} is not a confirmed write off`);
    }
  }

  handleFilterChange(searchInput: string) {
    const normalized = (input: string) => { return input?.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchInput);

    const filterSM = (item: IItemInfo) => {
      const itemSM = item.IsIndividual.toUpperCase();
      return normalized(itemSM) === normalizedQuery;
    }

    const filterExpression = (item: IItemInfo) => {
      return normalized(item.Asset_No).includes(normalizedQuery)
        || normalized(item.Category).includes(normalizedQuery)
        || normalized(item.Asset_LocationLocation).includes(normalizedQuery)
        || normalized(item.EPC_ID).includes(normalizedQuery)
        || normalized(item.Description).includes(normalizedQuery)
        || normalized(item.Asset_StatusName).includes(normalizedQuery);
    }

    if (normalizedQuery.length == 1) { this.viewWriteOffList = this.writeOffList.filter(filterSM); }
    else { this.viewWriteOffList = this.writeOffList.filter(filterExpression); }
  }

  onClearFilter(): void {
    this.searchInput = '';
    this.handleFilterChange(this.searchInput);
  }

  onClickReload() {
    this.selectedOrderNo = '';
    this.writeOffList = [];
    this.viewWriteOffList = [];
    this.confirmedWriteOffList = [];

    this._store.resetStates();
  }

  onClear(cleared: boolean) {
    if (cleared) {
      this.confirmedWriteOffList = [];
    }
  }

  onClickConfirm(): void {
   this.showRemarksPanel = true;
  }

  onCloseRemarksPanel(closeType: DialogCloseEventType) {
    this.showRemarksPanel = false;
    if (closeType === DialogCloseEventType.Confirm) {
      this.showSubmissionPanel = true;
    }
  }

  onCloseSubmission(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      const postWriteOffListParam: IScrapItem[] = [];
      this.confirmedWriteOffList.forEach(item => {
        postWriteOffListParam.push({
          "EPC_ID": item.EPC_ID,
          "Qty": item.LastBal.toString(),
          "Remarks": this.writeOffRemarks.length > 0 ? this.writeOffRemarks : item.Remarks,
          "userid": this._itsService.getKeyCloakUsername(),
        })
      });

      this._writeoffService.postWriteOffList(postWriteOffListParam)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.primary) {
            this._tagsService.clearScannedTags();
            this.onClickReload();
          }
        }
      });
    } else {
      console.log('Write-off submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this._store.setStates({
      selectedOrderNo: this.selectedOrderNo,
      searchInput: this.searchInput,
      writeOffList: this.writeOffList,
      viewWriteOffList: this.viewWriteOffList,
      confirmedWriteOffList: this.confirmedWriteOffList
    });

    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

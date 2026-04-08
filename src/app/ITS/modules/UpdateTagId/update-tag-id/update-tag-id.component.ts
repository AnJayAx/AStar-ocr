import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ToastService } from '@dis/services/message/toast.service';
import { Utils } from '@its/shared/classes/utils';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { UpdateItem } from '@its/shared/interfaces/frontend/updateItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, combineLatest, take, takeUntil } from 'rxjs';
import { UpdateTagidStoreService } from '../services/update-tagid-store.service';
import { UpdateTagidService } from '../services/update-tagid.service';

enum SearchMode {
  RFID = 'rfid',
  Keyword = 'keyword'
}

enum ErrorCode {
  Exists = 'exists',
  Duplicate = 'duplicate'
}

@Component({
  selector: 'app-update-tag-id',
  templateUrl: './update-tag-id.component.html',
  styleUrls: ['./update-tag-id.component.scss'],
  providers: [UpdateTagidService]
})
export class UpdateTagIdComponent implements OnInit, OnDestroy {
  ErrorCode = ErrorCode;
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();
  selectedSearchMode: SearchMode = SearchMode.Keyword;
  showUpdateDialog: boolean = false;

  keyword: string = '';
  itemInfoList: IItemInfo[] = [];
  selectedItem: IItemInfo;
  
  scannedTag: string;
  updateTag: string;

  showErrorMsg: boolean = false;
  errorMsg: string;

  constructor(
    private _toast: ToastService,
    private _itsService: ItsServiceService,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
    private _storeService: UpdateTagidStoreService,
    private _updatetagidService: UpdateTagidService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Update Tag ID', 'mainmenunew');
  }

  get disableUpdateBtn(): boolean { return this.showErrorMsg===true || this.scannedTag?.length===0; }

  ngOnInit(): void {
    this._storeService.loadState$.pipe(take(1)).subscribe({
      next: (values) => {
        this.showUpdateDialog = values.showUpdateDialog;
        this.keyword = values.keyword;
        this.itemInfoList = values.itemInfoList;
        this.selectedItem = values.selectedItem;
        this.scannedTag = values.scannedTag;
        this.updateTag = values.updateTag;
        this.showErrorMsg = values.showErrorMsg;
        this.errorMsg = values.errorMsg;
      }
    });

    combineLatest({
      scannedTag: this._storeService.scannedTag$,
      scannedUpdateItemArr: this._updatetagidService.incomingScannedUpdateItem$
    })
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (values) => {
        this.scannedTag = values.scannedTag;
        this.updateTag = this.scannedTag;
        if (values.scannedUpdateItemArr.length > 0) {
          this.showErrorMsg = true;
          if (values.scannedUpdateItemArr[values.scannedUpdateItemArr.length-1].EPC_ID === this.selectedItem?.EPC_ID) {
            this.errorMsg = 'Same tag detected!'
          } else {
            this.errorMsg = 'Tag ID is not available for use. Please try another tag.'
          }        
        } else {
          this.showErrorMsg = false;
          this.errorMsg = '';
          this._storeService.setUpdateTagId(this.updateTag);
        }
        this._storeService.setShowErrorMsg(this.showErrorMsg);
        this._storeService.setErrorMsg(this.errorMsg);
        this._updatetagidService.resetTags();
        this.ref.detectChanges();
      }
    });
  }

  onUpdateTagEdit(): void {
    this.showErrorMsg = false;
    this.errorMsg = '';
  }

  onClickSearch() {
    this._storeService.setKeyword(this.keyword);

    if (this.keyword?.length <= 0) {
      this._toast.info('Enter a keyword to proceed');
      return;
    }

    this._itsService.getItemInfoByKeyword(this.keyword).subscribe({
      next: (itemInfos) => {
        this.itemInfoList = itemInfos;
        if (this.itemInfoList.length <= 0) {
          this._toast.warning(`No results found for "${this.keyword}"`);
        }
        this._storeService.setItemInfoList(itemInfos);
      }
    });
  }

  onSelectItem(selectedItem: IItemInfo) {
    this.selectedItem = selectedItem;
    this.updateTag = this.selectedItem.EPC_ID;
    this.showUpdateDialog = true;

    this._storeService.setSelectedItem(selectedItem);
    this._storeService.setUpdateTagId(this.selectedItem.EPC_ID);
    this._storeService.setShowUpdateDialog(this.showUpdateDialog); 

    this.ref.detectChanges();
  }

  isSelectedItem(item: IItemInfo) {
    return this.selectedItem?.EPC_ID === item.EPC_ID;
  }

  onClickClear() {
    this.keyword = '';
    this.itemInfoList = [];
  }

  onClickUpdate() {
    this._itsService.postItemsByEpcId([{ "EPC_ID": this.updateTag }]).pipe(take(1)).subscribe({
      next: (itemInfoArr) => {
        if (itemInfoArr.length > 0) {
          this.showErrorMsg = true;
          this.errorMsg = 'Tag ID is not available for use. Please try another tag.'
        } else {
          this.showErrorMsg = false;
          this.errorMsg = '';
        }
      }
    });

    const userId = this._itsService.getServerUserId();
    const updateItem: UpdateItem = {
      "Asset_ID": Utils.removeNullValue(this.selectedItem.Asset_ID.toString()),
      "Category": Utils.removeNullValue(this.selectedItem.Category),
      "Description": this.selectedItem.Description,
      "SKU": this.selectedItem.SKU,
      "UOM": this.selectedItem.UOM,
      "BatchNo": Utils.removeNullValue(this.selectedItem.BatchNo).toString(),
      "Asset_No": this.selectedItem.Asset_No,
      "Ref_No": this.selectedItem.Ref_No,
      "EPC_ID": this.updateTag,
      "Date_of_Purchase": Utils.removeNullValue(this.selectedItem.Date_of_Purchase),
      "Asset_Status_ID": Utils.removeNullValue(this.selectedItem.Asset_Status_ID).toString(),
      "AssetStatus": this.selectedItem.Asset_StatusName,
      "Cost": Utils.removeNullValue(this.selectedItem.Cost).toString(),
      "Asset_Location_ID": Utils.removeNullValue(this.selectedItem.Asset_Location_ID).toString(),
      "AssetLocation": this.selectedItem.Asset_LocationLocation,
      "Date_of_Expire": Utils.removeNullValue(this.selectedItem.Date_of_Expire),
      "Warranty_Expiry_Date": Utils.removeNullValue(this.selectedItem.Warranty_Expiry_Date),
      "Calibration_Date": Utils.removeNullValue(this.selectedItem.Calibration_Date),
      "Remarks": Utils.removeNullValue(this.selectedItem.Remarks),
      "Remarks2": Utils.removeNullValue(this.selectedItem.Remarks2),
      "Remarks3": Utils.removeNullValue(this.selectedItem.Remarks3),
      "Remarks4": Utils.removeNullValue(this.selectedItem.Remarks4),
      "Remarks5": Utils.removeNullValue(this.selectedItem.Remarks5),
      "Remarks6": Utils.removeNullValue(this.selectedItem.Remarks6),    
    }
    this._updatetagidService.postUpdate(this.selectedItem.Asset_ID, userId, updateItem).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => {
        if (response.primary) {
          this._updatetagidService.resetTags();
          this.closeUpdateDialog();
          this.selectedItem = undefined;
          this.onClickClear();
        }        
      }
    })
  }

  closeUpdateDialog() {
    this.showUpdateDialog = false; 
    this.scannedTag = undefined;
    this.showErrorMsg = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

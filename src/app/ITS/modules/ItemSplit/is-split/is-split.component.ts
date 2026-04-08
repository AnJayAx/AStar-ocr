import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { searchIcon, trashIcon } from '@progress/kendo-svg-icons';
import { combineLatest, filter, Subject, takeUntil } from 'rxjs';
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { Router } from '@angular/router';
import { ToastService } from '@dis/services/message/toast.service';
import { ItemsplitService } from '../services/itemsplit.service';
import { IHHSplit } from '@its/shared/interfaces/backend/HHSplit';
import { LayoutService } from '@dis/services/layout/layout.service';
import { IsSplitStoreService } from '../services/is-split-store.service';
@Component({
  selector: 'app-is-split',
  templateUrl: './is-split.component.html',
  styleUrls: ['./is-split.component.scss'],
  providers: [ItemsplitService]
})
export class IsSplitComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  searchIcon = searchIcon;
  expandIcon = faUpRightAndDownLeftFromCenter;
  trashIcon = trashIcon;
  splitItem: ISelectedTag;
  isSerialized: boolean;
  showExpandedDialog: boolean = false;
  showRepackPanel: boolean = false;
  showSubmissionPanel: boolean = false;

  private nonSerializedCheckoutQty: number;
  nonSerializedTag: string;

  private serializedCheckoutQty: number;
  serializedTags: string[] = [];

  constructor(
    private router: Router,
    private _tagsService: ScannedTagsService,
    private toast: ToastService,
    private _itemsplitService: ItemsplitService,
    private _layoutService: LayoutService,
    private ref: ChangeDetectorRef,
    private _storeService: IsSplitStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Split', 'is-scan');

    this._itemsplitService.splitItem$().subscribe({
      next: (item) => {
        if (!!item) {
          this.splitItem = item;
        } else {
          this.toast.error('Error: No item detected from previous page');
          console.error('LoadedItemData failed to load from is-scan page');
        }
      }
    });
  }

  ngOnInit(): void {
    combineLatest({
      isSerialized: this._storeService.isSerializedState$,
      serializedTags: this._storeService.serializedTagsState$,
      nonSerializedTag: this._storeService.nonSerializedTagState$,
      nonSerializedCheckoutQty: this._storeService.nonSerializedCheckoutQtyState$,
    })
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (state) => {
        console.log('[is-split] state updated', state);
        this.isSerialized = state.isSerialized;
        this.serializedTags = state.serializedTags;
        this.serializedCheckoutQty = this.serializedTags?.length;
        this.nonSerializedTag = state.nonSerializedTag;
        this.nonSerializedCheckoutQty = state.nonSerializedCheckoutQty;

        this.ref.detectChanges();
      }
    });

    this._itemsplitService.invalidTagsDialog$()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => {
        this._tagsService.resetTagsService();
      }
    });

    this._itemsplitService.validTags$()
     .pipe(
      takeUntil(this.destroyed$),
      filter(tags => tags.length > 0) 
    )
    .subscribe({
      next: (tags) => {
        let matchExists = false;

        if (this.isSerialized) {
          const updatedSerializedTags = [...new Set(this.serializedTags.concat(tags))];

          matchExists = updatedSerializedTags.includes(this.splitItem.EPC_ID);
          if (matchExists) {
            const removeIdx = this.serializedTags.indexOf(this.splitItem.EPC_ID);
            updatedSerializedTags.splice(removeIdx, 1);
          }

          this._storeService.setSerializedTagsState(updatedSerializedTags);

        } else {
          const updatedNonSerializedTag = tags[0];
          this._storeService.setNonSerializedTagState(updatedNonSerializedTag);
          matchExists = updatedNonSerializedTag === this.splitItem.EPC_ID;
          if (matchExists === false) {
            const updatedNonSerializedCheckoutQty = !!this.nonSerializedCheckoutQty ? this.nonSerializedCheckoutQty : 1;
            this._storeService.setNonSerializedCheckoutQty(updatedNonSerializedCheckoutQty);
          } else {
            this._storeService.setNonSerializedTagState(undefined);
          }
        }

        if (matchExists) {
          this.toast.warning('Matching EPC ID tag has been detected and will be ignored.');
        }

        this._tagsService.resetTagsService();
      }
    });
  }

  confirmBtnDisabled(): boolean {
    return this.getDisplayCheckoutQty()===null || !this.submissionTagsAvailable();
  }

  getMax(): number {
    if (!!this.splitItem && !this.isSerialized) {
      return this.splitItem.LastBal;
    } else {
      return null;
    }
  }

  getDisplayCheckoutQty(): number {
    return this.isSerialized && this.serializedCheckoutQty ? this.serializedCheckoutQty : !this.isSerialized && this.nonSerializedCheckoutQty ? this.nonSerializedCheckoutQty : null;
  }
  
  getRepackQty(): number {
    return this.isSerialized && this.serializedCheckoutQty ? 1 : this.nonSerializedCheckoutQty;
  }

  getSplitTags(): string[] {
    return this.isSerialized ? this.serializedTags : [this.nonSerializedTag];
  }

  onSerializeToggleChange(isToggled: boolean) {
    this._storeService.setIsSerializedState(isToggled);
  }

  onCheckoutQtyChange(updatedQty: number) {
    if (!this.isSerialized) {
      this._storeService.setNonSerializedCheckoutQty(updatedQty);
    }
  }

  toggleExpandedDialog(isExpanded: boolean) {
    this.showExpandedDialog = isExpanded;
  }

  onClear(isCleared: boolean) {
    if (isCleared) {
      this._storeService.setNonSerializedTagState(null);
      this._storeService.setSerializedTagsState([]);
      this._storeService.setNonSerializedCheckoutQty(null);
    }
  }

  onDeleteTags(selectedTags: string[]) {
    const updatedSerializedTags = this.serializedTags.filter(tag => !selectedTags.includes(tag));
    this._storeService.setSerializedTagsState(updatedSerializedTags);
    console.log('onDelete', this.serializedTags);
  }

  onClickConfirm() { 
    // Disable comment to trigger repack dialog
    // if (this.getRepackQty() > 0) {
    //   this.showRepackPanel = true; 
    // }
    this.showSubmissionPanel = true;
  }

  onRepackClose(closeEvent: DialogCloseEventType) {
    this.showRepackPanel = false;
    this.showSubmissionPanel = closeEvent === DialogCloseEventType.Submit ? true : false;
  }

  onSubmissionClose(closeEvent: DialogCloseEventType) {
    if (closeEvent == DialogCloseEventType.Submit) {
      const postSplitItems: IHHSplit = {
        "Asset_ID": this.splitItem.Asset_ID,
        "CheckoutQty": this.isSerialized ? '1' : this.nonSerializedCheckoutQty.toString(),
        "remarks": 'split item',
        "EPCIDs": this.getSplitTags().map(tag => { return {"EPC_ID": tag }}),
      };
      console.log('postSplitItems', postSplitItems);
      this._itemsplitService.postItemSplit(postSplitItems).subscribe({
        next: (response) => {
          if (response.primary) {
            this._tagsService.clearScannedTags();
            this.router.navigate(['/is-scan']);
          }
        }
      });
    }
    this.showSubmissionPanel = false;
  }

  private submissionTagsAvailable(): boolean {
    return (this.isSerialized && this.serializedTags?.length>0) || (!this.isSerialized && this.nonSerializedTag?.length>0);
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { faArrowRight, faCircleCheck, faList } from '@fortawesome/free-solid-svg-icons';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IReceiveVerifyOrderPickedLine } from '@its/shared/interfaces/backend/SPT_Doc/ReceiveVerifyOrder';
import { IRVOrderItem } from '@its/shared/interfaces/frontend/RVOrderItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { distinctUntilChanged, Subject, switchMap, takeUntil, tap, filter, Observable, take } from 'rxjs';
import { RvOrderService } from '../services/rv-order.service';
import { RvPickeditemsService } from '../services/rv-pickeditems.service';
import { RvScanService } from '../services/rv-scan.service';
import { RvSubmissionService } from '../services/rv-submission.service';
import { RvVerificationitemsStoreService, VItemTrackerValue } from '../services/rv-verificationitems-store.service';
import { ReloadComponentService } from '@its/shared/services/reload-component.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { RefreshService } from '@its/shared/services/refresh.service';
import { ToastService } from '@dis/services/message/toast.service';

@Component({
  selector: 'app-rv-list',
  templateUrl: './rv-list.component.html',
  styleUrls: ['./rv-list.component.scss']
})
export class RvListComponent implements OnInit, OnDestroy {
  circleCheck = faCircleCheck;
  arrowRight = faArrowRight;
  showSubmissionPanel: boolean = false;
  private destroyed$: Subject<boolean> = new Subject();
  showDestinationLocation: boolean = false;
  destinationLocation: string;
  reloadElemRef: ElementRef;
  reloadComponent: any;

  orderItems$: Observable<IRVOrderItem[]> = this._refresh.refreshToken$.pipe(switchMap(() => this._rvorderService.getAvailableOrders()));
  selectedOrderItem: IRVOrderItem;
  selectedPickedItems: IReceiveVerifyOrderPickedLine[] = [];

  verificationItemTracker: Map<string, VItemTrackerValue>;
  postItems: IReceiveVerifyOrderPickedLine[];
  
  get rvType(): string {
    return this.selectedOrderItem?.isNormalPicking ? "Verify" : "Receive";
  }
  isConfirmDisabled = true;

  constructor(
    private tagssvc: ScannedTagsService,
    private ref: ChangeDetectorRef,
    private _rvorderService: RvOrderService,
    private _rvverifyitemsService: RvVerificationitemsStoreService,
    private _rvscanService: RvScanService,
    private _rvpickeditemsService: RvPickeditemsService,
    private _itsdialog: ItsDialogService,
    private _rvsubmissionService: RvSubmissionService,
    private _refresh: RefreshService,
    private elemRef: ElementRef,
    private _layoutService: LayoutService,
    private _toast: ToastService
  ) { 
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Receive/Verify', 'mainmenunew');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;
  }

  ngOnInit(): void {
    this._rvorderService.selectedOrderItem$
    .pipe(
      takeUntil(this.destroyed$),
      tap(order => console.log('selectedOrder updated', order))
    )
    .subscribe({
      next: selectedOrder => {
        if (!!selectedOrder) {
          this.selectedOrderItem = selectedOrder;
          this.showDestinationLocation = !this.selectedOrderItem.isNormalPicking;
          this.destinationLocation = this.selectedOrderItem.destinationLocation;
        } else {
          this.selectedOrderItem = null;
          this.selectedPickedItems = [];
          this.showDestinationLocation = false;
          this.destinationLocation = null;
        }
      }
    });

    this._rvorderService.selectedOrderItem$
    .pipe(
      takeUntil(this.destroyed$),
      filter(order => !!order),
      switchMap(selectedOrder => this._rvpickeditemsService.getPickedItemsByOrder(selectedOrder))
    )
    .subscribe({
      next: pickedItems => {
        this.selectedPickedItems = pickedItems;
        if (this.selectedPickedItems.length === 0) {
          alert(`No picked items found for order: ${this.selectedOrderItem.label}`);
        }
        this.ref.detectChanges();
      }
    });

    this._rvscanService.getIncomingTags()
    .pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
      tap(incomingtags => console.log('incoming tags', incomingtags))
    )
    .subscribe({
      next: tags => this._rvverifyitemsService.updateVerificationItemTrackerOnScan(tags)
    });

    this._rvverifyitemsService.verificationItemTracker$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: updatedTracker => {
        this.verificationItemTracker = updatedTracker;
        this.isConfirmDisabled = Array.from(this.verificationItemTracker.values()).map(value => value.verifiedQty).every(qty => qty === 0);
        this.ref.detectChanges();
      }
    });
  }

  isAllPicked(): boolean { 
    if (this.selectedPickedItems.length === 0) {
      return false;
    } else {
      return this.getReceiveVerifyPickedCount() === this.selectedPickedItems.length;
    }
  }

  getReceiveVerifyPickedCount(): number {
    let count = 0;
    if (this.verificationItemTracker?.size > 0) {
      for (const value of this.verificationItemTracker.values()) {
        if (value.verifiedQty >= value.pickedQty) {
          count++;
        }
      }
    }
    return count;
  }

  handleSelectedOrderChange(selectedOrderItem?: IRVOrderItem) {
    this._rvscanService.clearTags(false);
    this._rvorderService.setOrder(selectedOrderItem);
    this._rvpickeditemsService.getPickedItemsByOrder(selectedOrderItem).subscribe({
      next: pickedItems => this._rvverifyitemsService.setVerificationItemTrackerFromPickedItems(pickedItems)
    });
  }

  onClear(cleared: boolean) {
    if (cleared) {
      this._rvverifyitemsService.setVerificationItemTrackerFromPickedItems(this.selectedPickedItems);
      this._rvscanService.clearTags();
    }
  }

  onClickConfirm() {
    if (this._rvsubmissionService.zeroValuesValidated(this.verificationItemTracker)) {
      this.showSubmissionPanel = true;
    } else {
      this._itsdialog.zeroValuesFound().pipe(takeUntil(this.destroyed$)).subscribe({
        next: response => {
          console.log('Zero values found dialog closed');
          if (response.primary) {
            this.showSubmissionPanel = true;
          }
        }
      });
    }
  }

  onClose(eventType: DialogCloseEventType): void {
    this.showSubmissionPanel = false;
    if (eventType === DialogCloseEventType.Cancel) { return; }
    const postItems = this._rvsubmissionService.getPostPickedItems(this.selectedPickedItems, this.verificationItemTracker, this.selectedOrderItem);
    this._rvsubmissionService.postReceiveVerify(postItems).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => {
        if (response.primary) {
          this.onReload();
        }
      },
      error: () => this._toast.error('Error occurred during submission')
    });
  }

  onReload() {
    this._rvorderService.reset(); /* clear selected order item to trigger default load next */
    this._refresh.refresh();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

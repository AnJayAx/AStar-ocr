import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ReloadComponentService } from '@its/shared/services/reload-component.service';
import { Observable, Subject, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from 'rxjs';
import { ProductionTravelerService } from '../services/production-traveler.service';
import { IOperation } from '@its/shared/interfaces/backend/Operation';
import { ToastService } from '@dis/services/message/toast.service';
import { Router } from '@angular/router';
import { PtSubmissionStoreService } from '@its/modules/ProductionTraveler/services/pt-submission-store.service';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScanMode, ScanmodeService } from '@its/shared/services/scanmode.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { qrCodeIcon } from '@progress/kendo-svg-icons';
import { PtOperationSelectStoreService } from '../services/pt-operation-select-store.service';
import { PtOperationDetailsStoreService } from '../services/pt-operation-details-store.service';
import { PtItemScanStoreService } from '../services/pt-item-scan-store.service';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import { IItemTraits } from '@its/shared/interfaces/frontend/ItemTraits';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';

@Component({
  selector: 'app-pt-operation-select',
  templateUrl: './pt-operation-select.component.html',
  styleUrls: ['./pt-operation-select.component.scss']
})
export class PtOperationSelectComponent implements OnInit, OnDestroy, AfterViewInit {
  qrCodeIcon = qrCodeIcon;
  itemIcon = faCube;
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef;
  reloadComponent: any;

  isCameraValid$: Observable<boolean> = this._barcodeService.cameraValid$;

  sku: string = this._ptOpSelectStore.skuState;
  itemTrait: IItemTraits = this._ptOpSelectStore.selectedSkuItemTraitsState;
  workOrder: string = '';
  isFirstOp: boolean = this._ptOpSelectStore.isFirstOpState;
  firstOp: IOperation = this._ptOpSelectStore.firstOpState;

  public skuList: string[] = [];

  undefinedFirstOperationDetected: boolean = false;
  
  constructor(
    private elemRef: ElementRef,
    private _layoutService: LayoutService,
    private _reload: ReloadComponentService,
    private _ptService: ProductionTravelerService,
    private _toast: ToastService,
    private router: Router,
    private _barcodeService: ScanBarcodeService,
    private _scanmodeService: ScanmodeService,
    private ref: ChangeDetectorRef,
    private _tagsService: ScannedTagsService,
    private _ptStore: PtSubmissionStoreService,
    private _ptOpSelectStore: PtOperationSelectStoreService,
    private _ptOpDetailsStore: PtOperationDetailsStoreService,
    private _ptItemScanStore: PtItemScanStoreService,
    private _commondataService: CommonDataService,
    private _commonstore: CommonStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Production Traveler', 'mainmenunew');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;
    this._ptStore.reset();

    console.log('DEBUG pt-operation-select connect barcode reader');
    this._barcodeService.connectReader()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (response) => {
        console.log('[B] Response from native: ', response);
        this._scanmodeService.setSelectedScanMode(ScanMode.Barcode);
      }
    });

    if (this.router.getCurrentNavigation().extras.state?.data) {
      this.workOrder = this.router.getCurrentNavigation().extras.state["data"];
    }
  }

  toQRPage() {
    this.router.navigate(['qr-scan-page', { backUrl: 'pt-op-select' }]);
  }

  get showAdditionalOptions(): boolean { return this.sku?.length > 0; }

  ngOnInit(): void {
    this._ptService.getAllItemMasterSku().subscribe({
      next: (skus) => {
        this.skuList = skus;
        if (this.sku.length === 0) {
          this.sku = this.skuList[0];
        }
      }
    });

    /* initialize if direct entry into module (ie. bypassing main menu page) */
    this._commondataService.inboundVerifyStatus$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (status) => this._commonstore.initInboundVerifyStatusStateIfUndefined(status)
    });
    this._commondataService.inboundVerifyValue$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (value) => this._commonstore.initInboundVerifyValueIfUndefined(value)
    });
    this._commondataService.serverUser$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (user) => this._commonstore.initServerUserStateIfUndefined(user)
    });
    this._commondataService.userCompany$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (company) => this._commonstore.initUserCompanyStateIfUndefined(company)
    });
  }

  ngAfterViewInit(): void {
    this._ptService.getAllItemMasterSku().pipe(
      map(skus => this.sku.length === 0 ? skus[0] : this.sku),
      switchMap(selectedSku => this._ptService.getProductDimensionsBySku(selectedSku))
    ).subscribe({
      next: (dimensions) => {
        this.itemTrait = dimensions;
        this.ref.detectChanges();
      }
    });

    this._ptService.incomingBarQRCode$
    .pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged((prev, current) => prev === current),
    )
    .subscribe({
      next: (data) => {
        if (data?.length > 0) {
          this.workOrder = data;
          this.ref.detectChanges();
          this._tagsService.resetTagsService();
        }
      }
    });
  }

  onSkuChange(newSku: string) {
    this.sku = newSku;
    this.isFirstOp = false;
    this.firstOp = null;

    this.loadItemTraits(this.sku);
  }

  private loadItemTraits(sku: string) {
    if (this.sku?.length > 0) {
      this._ptService.getProductDimensionsBySku(sku)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (dimensions) => {
          this.itemTrait = dimensions;
          this.ref.detectChanges();
        }
      });
    } else {
      this.itemTrait = null;
    }
  }

  onWorkOrderChange(newWorkOrder: string) {
    this.workOrder = newWorkOrder;
  }


  onToggleIsFirstOp() {
    if (!this.isFirstOp && this.sku?.length === 0) {
      this._toast.warning('Please enter an SKU number');
      return;
    }

    this.isFirstOp = !this.isFirstOp;
    
    if (this.isFirstOp ) {
      this._ptService.getFirstOperationBySku(this.sku)
      .pipe(take(1))
      .subscribe({
        next: (firstOp) => {
          if (!firstOp) {
            this._toast.warning(`No operation details found for SKU: ${this.sku}`);
            this.undefinedFirstOperationDetected = true;
            this.isFirstOp = false;
            this.firstOp = null;
          } else {
            this.firstOp = firstOp;
            this.undefinedFirstOperationDetected = false;
          }
        }
      });
    } else {
      this.undefinedFirstOperationDetected = false;
    }
  }

  onClickReload(clicked: boolean) {
    if (clicked)  {
      this._ptStore.reset();
      this._ptItemScanStore.reset();
      this._ptOpDetailsStore.reset();
      this._ptOpSelectStore.reset();
      this.onSkuChange('');
    }
  }

  onReload(reloaded: boolean) {
    if (reloaded) {
      this._ptStore.reset();
      this._ptItemScanStore.reset();
      this._ptOpDetailsStore.reset();
      this._ptOpSelectStore.reset();
  
      this._reload.reloadComponent(this.reloadComponent, this.reloadElemRef);
    }
  }

  onClickConfirm(): void {
    this._ptStore.reset();
    this._ptItemScanStore.reset();
    this._ptOpDetailsStore.reset();
    this._ptOpSelectStore.reset();

    if (this.isFirstOp) {
      this._ptStore.setFirstOperationSku(this.sku);
      this._ptStore.setFirstOperationOperation(this.firstOp);
      if (this.workOrder?.length > 0) { this._ptStore.setFirstOperationWorkOrder(this.workOrder); }
      this.router.navigate(['pt-op-details', { sku: this.sku }]);
    }
    else {
      this.router.navigate(['pt-item-scan', { sku: this.sku }]);
    }
  }

  ngOnDestroy(): void {
    this._ptOpSelectStore.setSkuState(this.sku);
    this._ptOpSelectStore.setIsFirstOpState(this.isFirstOp);
    this._ptOpSelectStore.setFirstOpState(this.firstOp);
    this._ptOpSelectStore.setSelectedSkuItemTraitsState(this.itemTrait);

    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

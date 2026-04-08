import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rb-scan',
  templateUrl: './rb-scan.component.html',
  styleUrls: ['./rb-scan.component.scss']
})
export class RbScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  private scannedItems: IItemInfo[] = [];

  public REFURBISH_FILTERBYAND: IScanViewListFilter[] = [
    { property: 'Asset_Status_ID', value: 1000001 } /* Available items only */
  ];

  constructor(
    private _tagsService: ScannedTagsService,
    private _layoutService: LayoutService,
    private _internalService: InternalItsServiceService,
    private _scanviewService: ScanViewService,
    private router: Router,
    private _commondataService: CommonDataService,
    private _commonstore: CommonStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Refurbishment', 'mainmenunew');
  }

  ngOnInit(): void {
    this._scanviewService.getSelectedItemInfoList().subscribe({
      next: (selectedItems) => { 
        this.scannedItems = selectedItems;
        console.log('[rb-scan] selected scanned items', this.scannedItems); 
      },
      error: (error) => { console.error(`Error occurred in relocation-module getSelectedItemInfoList() subscription: ${error}`); }
    });

    /* initialize if direct entry into module (ie. bypassing main menu page) */
    this._commondataService.blockchainConnectionEnabled$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isConnected) => this._commonstore.initBlockchainConnectionEnabledStateIfUndefined(isConnected)
    });
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

  onConfirm(confirmed: boolean) {
    if (confirmed && this.scannedItems.length > 0) {
      this._internalService.replaceSelectedScanItems(this.scannedItems);
      this.router.navigate(['/rb-form']);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

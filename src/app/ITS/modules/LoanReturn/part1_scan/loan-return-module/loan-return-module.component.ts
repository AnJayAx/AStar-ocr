import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternalItsServiceService } from '../../../../shared/services/internal-its-service.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { Subject, takeUntil } from 'rxjs';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { Utils } from '@its/shared/classes/utils';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-loan-return-module',
  templateUrl: './loan-return-module.component.html',
  styleUrls: ['./loan-return-module.component.scss']
})
export class LoanReturnModuleComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject();
    
    private scannedItems: IItemInfo[] = [];
    private formItems: ISelectedTag[] = [];

    public LOANRETURN_FILTERBYAND: IScanViewListFilter[] = [
      {property: 'IsIndividual', value: 'S'},
    ];
    public LOANRETURN_FILTERBYOR: IScanViewListFilter[] = [
      /* Represents Available and OnLoan items */
      { property: 'Asset_Status_ID', value: 1000001 },
      { property: 'Asset_Status_ID', value: 1000007 }
    ];

    constructor(
        private router: Router,
        private _internalService: InternalItsServiceService,
        private _scanviewService: ScanViewService,
        private _layoutService: LayoutService,
    ) {
      this._layoutService.changeTitleDisplayAndSetNavBackPath('Loan/Return', 'mainmenunew');
    }

    ngOnInit(): void {
        this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (selectedItems) => { this.scannedItems = selectedItems; },
            error: (error) => { console.error(`Error occurred in relocation-module getSelectedItemInfoList() subscription: ${error}`); }
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }

    onConfirm(confirmed: boolean) {        
      if (confirmed && this.scannedItems.length > 0) {
        this.formItems = this.scannedItems.map(scanItem => Utils.ItemInfoToTag(scanItem));        this._internalService.replaceSelectedTags(this.formItems);
        this._internalService.replaceSelectedScanItems(this.scannedItems);
        this.router.navigate(['/loanreturnform']);
      } 
  }
}

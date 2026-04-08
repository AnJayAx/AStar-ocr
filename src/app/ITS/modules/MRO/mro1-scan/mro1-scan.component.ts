import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternalItsServiceService } from '../../../shared/services/internal-its-service.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { Subject, takeUntil } from 'rxjs';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { Utils } from '@its/shared/classes/utils';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-mro1-scan',
  templateUrl: './mro1-scan.component.html',
  styleUrls: ['./mro1-scan.component.scss']
})
export class MRO1ScanComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject();
    
    private scannedItems: IItemInfo[] = [];
    private formItems: ISelectedTag[] = [];

    public MRO_FILTERBYAND: IScanViewListFilter[] = [
        { property: 'IsIndividual', value: 'S' },
    ];
    public MRO_FILTERBYOR: IScanViewListFilter[] = [
        { property: 'Asset_Status_ID', value: 1000001 }, // Available
        { property: 'Asset_Status_ID', value: 1000007 } // On Loan
    ]
  
    constructor(
        private router: Router,
        private _internalService: InternalItsServiceService,
        private _scanviewService: ScanViewService,
        private _layoutService: LayoutService,
    ) {
        this._layoutService.changeTitleDisplayAndSetNavBackPath('MRO', 'mainmenunew');
    }

    ngOnInit(): void {
        this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$)).subscribe({
            next: (selectedItems) => { this.scannedItems = selectedItems; },
            error: (error) => { console.error(`Error occurred in relocation-module getSelectedItemInfoList() subscription: ${error}`); }
        });
    }

    onConfirm(confirmed: boolean) {        
        if (confirmed && this.scannedItems.length > 0) {
            this._internalService.replaceSelectedScanItems(this.scannedItems);

            this.formItems = this.scannedItems.map(scanItem => Utils.ItemInfoToTag(scanItem));
            this._internalService.replaceSelectedTags(this.formItems);

            this.router.navigate(['/mroform']);
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }
}


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-check-status1-scan',
  templateUrl: './check-status1-scan.component.html',
  styleUrls: ['./check-status1-scan.component.scss']
})
export class CheckStatus1ScanComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject(); 
    private scannedItems: IItemInfo[] = [];
  
    constructor(
        private _scanviewService: ScanViewService,
        private router: Router,
        private _layoutService: LayoutService,
    ){
        this._layoutService.changeTitleDisplayAndSetNavBackPath('Check Status', 'mainmenunew');
    }

    ngOnInit(): void {
        this._scanviewService.getSelectedItemInfoList()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (selectedItems) => { this.scannedItems = selectedItems; },
            error: (error) => { console.error(`Error occurred in checkstatus-module getSelectedItemInfoList() subscription: ${error}`); }
        });
    }


    onConfirm(confirmed: boolean) {  
        if (confirmed && this.scannedItems.length === 1) {
            const scannedItem = this.scannedItems[0];
            this.router.navigate(['/checkstatus-inforouter'], { queryParams: { epc: scannedItem.EPC_ID, assetID: scannedItem.Asset_ID }});
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }
}

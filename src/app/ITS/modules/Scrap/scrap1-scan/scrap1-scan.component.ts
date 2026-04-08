import { Component, OnInit,  OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { Subject, takeUntil } from 'rxjs';
import { InternalItsServiceService } from '../../../shared/services/internal-its-service.service';
import { LayoutService } from '@dis/services/layout/layout.service';
@Component({
  selector: 'app-scrap1-scan',
  templateUrl: './scrap1-scan.component.html',
  styleUrls: ['./scrap1-scan.component.scss']
})
export class Scrap1ScanComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject();
    
    private scannedItems: IItemInfo[] = [];
  
    constructor(
        private router: Router,
        private _internalService: InternalItsServiceService,
        private _scanviewService: ScanViewService,
        private _layoutService: LayoutService,
    ) {
        this._layoutService.changeTitleDisplayAndSetNavBackPath('Scrap', 'mainmenunew');
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
            this.router.navigate(['/scrapform']);
        } 
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }
}

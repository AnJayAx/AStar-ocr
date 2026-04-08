import { Component, OnInit, OnDestroy } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { Subject, takeUntil } from 'rxjs';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-update1-scan',
  templateUrl: './update1-scan.component.html',
  styleUrls: ['./update1-scan.component.scss']
})
export class Update1ScanComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject(); 
    private scannedItems: IItemInfo[] = [];
  
    constructor(
        private router: Router,
        private _itsdialog: ItsDialogService,
        private _scanviewService: ScanViewService,
        private _layoutService: LayoutService,
    ) {
        this._layoutService.changeTitleDisplayAndSetNavBackPath('Update', 'mainmenunew');
    }

    ngOnInit(): void {
        this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (selectedItems) => { this.scannedItems = selectedItems; },
            error: (error) => { console.error(`Error occurred in update-module getSelectedItemInfoList() subscription: ${error}`); }
        });
    }

    onConfirm(confirmed: boolean) {        
        if (confirmed && this.scannedItems.length >= 1) {
            this.router.navigate(['/updateform'], { queryParams: { epcs: this.scannedItems.map(item => item.EPC_ID).toString(), assetIds: this.scannedItems.map(item => item.Asset_ID).toString() }});
        }
        else {
            this._itsdialog.noTagSelected().subscribe(() => console.log('Please select one item to submit'));
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }

}

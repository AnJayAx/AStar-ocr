import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternalItsServiceService } from '../../../../shared/services/internal-its-service.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { Subject, takeUntil } from 'rxjs';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { Utils } from '@its/shared/classes/utils';
import { LayoutService } from '@dis/services/layout/layout.service';
@Component({
  selector: 'app-relocation-module',
  templateUrl: './relocation-module.component.html',
  styleUrls: ['./relocation-module.component.scss']
})
export class RelocationModuleComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<boolean> = new Subject();
    
    private scannedItems: IItemInfo[] = [];

    public RELOCATION_FILTERBYOR: IScanViewListFilter[] = [
        { property: 'Asset_Status_ID', value: 1000001 }
    ];

    constructor(
        private router: Router,
        private _internalService: InternalItsServiceService,
        private _scanviewService: ScanViewService,
        private _layoutService: LayoutService,
    ) {
        this._layoutService.changeTitleDisplayAndSetNavBackPath('Relocation', 'mainmenunew');
    }

    ngOnInit(): void {
        this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (selectedItems) => { 
                console.log('DEBUG incoming selectedItemInfoList', selectedItems);
                this.scannedItems = selectedItems; 
            },
            error: (error) => { console.error(`Error occurred in relocation-module getSelectedItemInfoList() subscription: ${error}`); }
        });
    }
    
    onConfirm(confirmed: boolean) {        
        if (confirmed && this.scannedItems.length > 0) {
            const formItems = this.scannedItems.map(scanItem => Utils.ItemInfoToTag(scanItem));
            this._internalService.replaceSelectedTags(formItems);
            this.router.navigate(['/relocationform']);
        } 
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.unsubscribe();
    }
}

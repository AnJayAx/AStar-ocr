import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tr-scan',
  templateUrl: './tr-scan.component.html',
  styleUrls: ['./tr-scan.component.scss']
})
export class TrScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  private scannedItems: IItemInfo[] = [];

  constructor(
    private router: Router,
    private _itsdialog: ItsDialogService,
    private _scanviewService: ScanViewService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Tag Reuse', 'mainmenunew');
  }

  ngOnInit(): void {
    this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (selectedItems) => { this.scannedItems = selectedItems; },
      error: (error) => { console.error(`Error occurred in tr-scan getSelectedItemInfoList() subscription: ${error}`); }
    });
  }

  onConfirm(confirmed: boolean) {
    if (confirmed && this.scannedItems.length >= 1) {
      this.router.navigate(['/tr-form'], { queryParams: { epcs: this.scannedItems.map(item => item.EPC_ID).toString(), assetIds: this.scannedItems.map(item => item.Asset_ID).toString(), }});
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

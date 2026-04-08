import { Component, ElementRef, OnInit } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { Subject, takeUntil } from 'rxjs';
import { SmStoreService } from '../services/sm-store.service';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';

@Component({
  selector: 'app-sm-merge-to',
  templateUrl: './sm-merge-to.component.html',
  styleUrls: ['./sm-merge-to.component.scss']
})
export class SmMergeToComponent implements OnInit {
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef = this.elemRef;
  reloadComponent: any = this;

  public STOCKMERGE_FILTEROUT: IScanViewListFilter[] = [
    { property: 'Asset_StatusName', value: 'On Loan' },
    { property: 'Asset_StatusName', value: 'NotAvailable' },
    { property: 'Asset_StatusName', value: 'On Hold' },
    { property: 'Asset_StatusName', value: 'Scrapped' },
    { property: 'IsIndividual', value: 'S' } 
];

  selectedItem: IItemInfo;

  constructor(
    private elemRef: ElementRef,
    private _store: SmStoreService,
    private router: Router,
    private _layoutService: LayoutService,
    private _scanviewService: ScanViewService,
    private _tagsService: ScannedTagsService,
  ) { }

  ngOnInit(): void {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Stock Merge', 'mainmenunew');

    this._scanviewService.getSelectedItemInfoList()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (selectedItems) => { this.selectedItem = selectedItems[0]; }
    })
  }

  onClickReload() {
    this.selectedItem = undefined;
    this._store.setMergeToItem(this.selectedItem);
  }

  onConfirm(confirmed: boolean): void {
    if (confirmed && !!this.selectedItem) {
      this._store.setMergeToItem(this.selectedItem);
      this._tagsService.clearScannedTags();
      this.router.navigate(['/sm-merge-from']);
    }
  }


}

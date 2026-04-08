import { Component, OnInit } from '@angular/core';
import { SmStoreService } from '../services/sm-store.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { Router } from '@angular/router';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { Subject, takeUntil } from 'rxjs';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { STOCKMERGE_FILTEROUT } from '../stockmerge.constants';

@Component({
  selector: 'app-sm-merge-from',
  templateUrl: './sm-merge-from.component.html',
  styleUrls: ['./sm-merge-from.component.scss']
})
export class SmMergeFromComponent implements OnInit {
  private destroyed$: Subject<boolean> = new Subject();

  mergeToItem: IItemInfo = this._store.getMergeToItem();
  selectedItems: IItemInfo[] = [];

  public STOCKMERGE_FILTEROUT: IScanViewListFilter[] =  [...STOCKMERGE_FILTEROUT, { property: 'EPC_ID', value: this.mergeToItem.EPC_ID }];
  public STOCKMERGE_FILTERIN: IScanViewListFilter[] = [
    { property: 'Description', value: this.mergeToItem.Description },
    { property: 'BatchNo', value: this.mergeToItem.BatchNo }
  ];

  constructor(
    private _store: SmStoreService,
    private router: Router,
    private _scanviewService: ScanViewService,
    private _tagsService: ScannedTagsService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Stock Merge', 'sm-merge-to');
  }

  ngOnInit(): void {
    this._scanviewService.getSelectedItemInfoList()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (selectedItems) => { this.selectedItems = selectedItems; }
    })
  }

  onConfirm(confirmed: boolean): void {
    if (confirmed && this.selectedItems.length > 0) {
      this._store.setMergeFromItems(this.selectedItems);
      this._tagsService.clearScannedTags();
      this.router.navigate(['/sm-confirm-merge']);
    }
  }
}

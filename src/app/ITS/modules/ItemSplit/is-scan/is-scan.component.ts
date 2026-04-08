import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { Utils } from '@its/shared/classes/utils';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject, takeUntil } from 'rxjs';
import { IsSplitStoreService } from '../services/is-split-store.service';

@Component({
  selector: 'app-is-scan',
  templateUrl: './is-scan.component.html',
  styleUrls: ['./is-scan.component.scss']
})
export class IsScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  private scannedItems: IItemInfo[] = [];
  private formItem: ISelectedTag;

  public SPLIT_FILTEROUT: IScanViewListFilter[] = [
    { property: 'IsIndividual', value: 'S' }
  ];

  constructor(
    private _tagsService: ScannedTagsService,
    private router: Router,
    private _internalService: InternalItsServiceService,
    private _scanviewService: ScanViewService,
    private _layoutService: LayoutService,
    private _storeService: IsSplitStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Split', 'mainmenunew');
    
    this._scanviewService.getSelectedItemInfoList().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (selectedItems) => {
        this.scannedItems = selectedItems;
      }
    });
  }

  ngOnInit(): void {
  }

  onConfirm(confirmed: boolean) {
    if (confirmed && this.scannedItems.length == 1) {
      this.formItem = Utils.ItemInfoToTag(this.scannedItems[0]);

      this._internalService.replaceSelectedTags([this.formItem]);
      this._tagsService.resetTagsService();
      this._storeService.resetIsSplitStoreService();
      this.router.navigate(['/is-split'], { queryParams: { loadItem: JSON.stringify(this.formItem) }});
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

import { Component, OnInit } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { SmStoreService } from '../services/sm-store.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { take } from 'rxjs';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IScrapItem } from '@its/shared/interfaces/frontend/scrapItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { StockmergeService } from '../services/stockmerge.service';
import { Router } from '@angular/router';
import { faEquals, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sm-confirm-merge',
  templateUrl: './sm-confirm-merge.component.html',
  styleUrls: ['./sm-confirm-merge.component.scss']
})
export class SmConfirmMergeComponent implements OnInit {
  DialogCloseEventType = DialogCloseEventType;
  plusIcon = faPlus;
  equalsIcon = faEquals;
  searchTerm: string = '';

  mergeToItem: IItemInfo = this._store.getMergeToItem();
  mergeFromItems: IItemInfo[] = this._store.getMergeFromItems();
  viewMergeFromItems: IItemInfo[] = this.mergeFromItems.slice();

  stockMergeRemarks: string = '';
  showRemarksPanel: boolean = false;
  showSubmissionPanel: boolean = false;

  constructor(
    private _store: SmStoreService,
    private _layoutService: LayoutService,
    private _itsDialog: ItsDialogService,
    private _itsService: ItsServiceService,
    private _smService: StockmergeService,
    private router: Router,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Confirm Stock Merge', 'sm-merge-from');
  }

  ngOnInit(): void {
  }

  searchIsEmpty(): boolean { return this.mergeFromItems.length > 0 && this.viewMergeFromItems.length === 0; }

  handleFilterChange(searchFilter: string) {
    const normalized = (input: string) => { return input?.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchFilter);

    const filterSM = (item: IItemInfo) => {
      const itemSM = item.IsIndividual.toUpperCase();
      return normalized(itemSM) === normalizedQuery;
    }

    const filterExpression = (item: IItemInfo) => {
      return normalized(item.Asset_No).includes(normalizedQuery)
        || normalized(item.Category).includes(normalizedQuery)
        || normalized(item.Asset_LocationLocation).includes(normalizedQuery)
        || normalized(item.EPC_ID).includes(normalizedQuery)
        || normalized(item.Description).includes(normalizedQuery)
        || normalized(item.Asset_StatusName).includes(normalizedQuery);
    }

    if (normalizedQuery.length == 1) { this.viewMergeFromItems = this.mergeFromItems.filter(filterSM); }
    else { this.viewMergeFromItems = this.mergeFromItems.filter(filterExpression); }
  }

  onClearSearchFilter() {
    this.searchTerm = '';
    this.viewMergeFromItems = this.mergeFromItems.slice();
  }

  onDeleteMergeFromItem(item: IItemInfo) {
    this._itsDialog.genericConfirmAction('Delete Item?', `Delete ${item.Asset_ID}?`)
    .pipe(take(1))
    .subscribe({
      next: (response) => { if (response.primary) this.deleteAction(item); }
    });
  }

  private deleteAction(item: IItemInfo) {
    if (this.mergeFromItems.length === 1) {
      this._itsDialog.denyEmptyTagList().subscribe({ next: () => {} });
    } else {
      this.mergeFromItems = this.mergeFromItems.filter(x => x.EPC_ID !== item.EPC_ID);
      this.viewMergeFromItems = this.viewMergeFromItems.filter(x => x.EPC_ID !== item.EPC_ID);
    }
  }

  get updatedMergedItem(): IItemInfo {
    const updatedMergedItem = Object.assign({}, this.mergeToItem);
    updatedMergedItem['LastBal'] = this.mergeFromItems.reduce((accumulator, currentItem) => { return accumulator += currentItem.LastBal; }, this.mergeToItem['LastBal']);
    return updatedMergedItem;
  }

  onClickConfirm(): void {
    this.showRemarksPanel = true;
  }

  onCloseRemarksPanel(closeType: DialogCloseEventType) {
    this.showRemarksPanel = false;
    if (closeType === DialogCloseEventType.Confirm) {
      this.showSubmissionPanel = true;
    }
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      const postMergeFromItems: IScrapItem[] = [];
      this.mergeFromItems.forEach(item => {
        postMergeFromItems.push({
          "EPC_ID": item.EPC_ID,
          "Qty": item.LastBal.toString(),
          "userid": this._itsService.getServerUserId().toString(),
          "Remarks": this.stockMergeRemarks,
        });
      });

      this._smService.postStockMerge(this.mergeToItem.EPC_ID, postMergeFromItems).subscribe({
        next: (response) => {
          console.log('Stock merge posted', response);
          if (response.primary) {
            this._store.clearStore();
            this.router.navigate(['/sm-merge-to']);
          }
        }
      });
    } else {
      console.log('Stock merge submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { STStatus } from '../stocktaking.constants';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { StSettingsService } from '../services/st-settings.service';
import { FoundStlistService } from './found-stlist.service';
import { Subject, take, takeUntil } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { StFiltersStoreService } from '../services/st-filters-store.service';

@Component({
  selector: 'app-st-scan-found',
  templateUrl: './st-scan-found.component.html',
  styleUrls: ['./st-scan-found.component.scss'],
  providers: [FoundStlistService]
})
export class StScanFoundComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  faCubes = faCubes;

  loadFoundItems: boolean = this._stSettingsService.getLoadFoundItems();
  toggledView: 'all' | 'highlighted' = 'all';
  selectedStNo: string = this._stfiltersService.storedSelectedStNo;

  filterBy: STStatus = STStatus.Found;

  allListItems: ISTItem[] = [];
  listItems: ISTItem[] = [];

  constructor(
    private _stSettingsService: StSettingsService,
    private _foundlistService: FoundStlistService,
    private _layoutService: LayoutService,
    private _stfiltersService: StFiltersStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Found', 'st-scan');
  }

  private isHighlighted(item: ISTItem) { return item.SM?.toUpperCase() === 'M'; }
  
  ngOnInit(): void {
    this.loadListItems();
  }

  onClickToggleView(selectedView:'all'|'highlighted') { 
    this.toggledView = selectedView; 
    this.onListViewChange();
  }

  private loadListItems(): void {
    this._foundlistService.foundList$
    .pipe(
      takeUntil(this.destroyed$),
      take(1),
    )
    .subscribe({
      next: (foundItems) => {
        this.allListItems = foundItems;
        const getEditViewFirst = () => {
          const typeList = this.allListItems.map(item => item.SM.toUpperCase());
          return typeList.includes('M');
        }
        this.toggledView = getEditViewFirst() ? 'highlighted' : 'all';
        this.onListViewChange();
      }
    });
  }

  private onListViewChange() {
    if (!this.allListItems) { console.error('List items is undefined.'); return; }
    if (this.toggledView === 'highlighted') { this.listItems = this.allListItems.filter(item => this.isHighlighted(item)); }
    else { this.listItems = this.allListItems; }
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

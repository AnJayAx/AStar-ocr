import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { StSettingsService } from '../services/st-settings.service';
import { OverviewStlistService } from './overview-stlist.service';
import { Observable, Subject, combineLatest, filter, takeUntil } from 'rxjs';
import { LayoutService } from '@dis/services/layout/layout.service';
import { StScanMenurouterService } from '../st-scan-menurouter/st-scan-menurouter.service';
import { STStatus } from '../stocktaking.constants';
import { StFiltersStoreService } from '../services/st-filters-store.service';

@Component({
  selector: 'app-st-scan-overview',
  templateUrl: './st-scan-overview.component.html',
  styleUrls: ['./st-scan-overview.component.scss'],
  providers: [OverviewStlistService]
})
export class StScanOverviewComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  loadFoundItems: boolean = this._stsettingsService.getLoadFoundItems();
  selectedStNo: string = this._stfiltersService.storedSelectedStNo;
  
  allItemsList$: Observable<ISTItem[]>; /* updated ST items list of all or pending-only status types */
  private allItemsList: ISTItem[] = []; 
  listItems: ISTItem[] = [];

  constructor( 
    private _stsettingsService: StSettingsService,
    private _overviewListService: OverviewStlistService,
    private _layoutService: LayoutService,
    private ref: ChangeDetectorRef,
    private _menurouterService: StScanMenurouterService,
    private _stfiltersService: StFiltersStoreService,
  ) {}

  
  ngOnInit(): void {
    this._menurouterService.selectedFilter$
    .pipe(filter(selectedFilter => selectedFilter === STStatus.Submitted || selectedFilter === STStatus.Pending))
    .subscribe({
      next: (selectedFilter) => {
        if (this.loadFoundItems && selectedFilter === STStatus.Submitted) { /* Submitted status should only be selectable when found items are loaded anyway */
          this._layoutService.changeTitleDisplayAndSetNavBackPath('Submitted', 'st-scan');
          this.allItemsList$ = this._overviewListService.getSubmittedList().pipe(takeUntil(this.destroyed$));
        } else {
          this._layoutService.changeTitleDisplayAndSetNavBackPath('Pending', 'st-scan');
          this.allItemsList$ = this._overviewListService.getPendingList().pipe(takeUntil(this.destroyed$));
        }
        this.updateItemList();
      }
    });
  }

  private updateItemList(): void {
    this.allItemsList$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (list) => {
        this.allItemsList = list;
        this.listItems = [...this.allItemsList];
        this.ref.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

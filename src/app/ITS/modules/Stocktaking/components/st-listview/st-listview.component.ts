import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { PagerSettings } from '@progress/kendo-angular-listview/main';
import { Subject, takeUntil } from 'rxjs';
import { StSettingsService } from '../../services/st-settings.service';
import { StScanMenurouterService } from '../../st-scan-menurouter/st-scan-menurouter.service';
import { DeletableSTListTypes, EditableSTListTypes, ShowItemInfoListTypes, STStatus } from '../../stocktaking.constants';

@Component({
  selector: 'app-st-listview',
  templateUrl: './st-listview.component.html',
  styleUrls: ['./st-listview.component.scss']
})
export class StListviewComponent implements OnInit, OnChanges, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  @ViewChild('listview') listview;
  public pagerSettings: PagerSettings;
  public pageSize: number;
  
  @Input() listData: ISTItem[];
  @Output() updatedListData: EventEmitter<ISTItem[]>;
  viewListData: ISTItem[];

  isDeletable: boolean = false;
  isEditable: boolean = false;
  showItemInfo: boolean = false;
  displaySTLastBal: boolean = false;

  private initPager(): void {
    this.pagerSettings = {
      previousNext: true,
      type: 'input',
    };
    this.pageSize = 10;
  }

  constructor(
    private _menurouterService: StScanMenurouterService,
    private _stsettingsService: StSettingsService,
  ) { 
    this.initPager(); 
    
    this._menurouterService.selectedFilter$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (selectedFilter) => {
        const DELETABLE_LIST_TYPES = DeletableSTListTypes;
        if (DELETABLE_LIST_TYPES.includes(selectedFilter)) {
          this.isDeletable = true;
        }

        const EDITABLE_LIST_TYPES = EditableSTListTypes;
        if (EDITABLE_LIST_TYPES.includes(selectedFilter)) {
          this.isEditable = true;
        }

        const SHOW_ITEM_INFO_LIST_TYPES = ShowItemInfoListTypes;
        if (SHOW_ITEM_INFO_LIST_TYPES.includes(selectedFilter)) {
          this.showItemInfo = true;
        }
      }
    });

    this._stsettingsService.getDisplaySTBalSetting().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isDisplay) => { this.displaySTLastBal = isDisplay; }
    });

  }

  ngOnInit(): void { this.viewListData = [...this.listData]; }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.listData) { 
      this.viewListData = [...this.listData];
      this.initPager();
    }
    if (!!this.listview) {
      this.listview.skip = 0;
    }
  }

  handleFilterChange(searchInput: string, listview) {
    listview.skip = 0;

    const normalized = (input: string) => { return input.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchInput);

    const filterSM = (item: ISTItem) => {
      return normalized(item.SM) == normalizedQuery;
    }
    const filterExpression = (item: ISTItem) => {
      return filterSM
        || normalized(item.Asset_No).includes(normalizedQuery)
        || normalized(item.Category).includes(normalizedQuery)
        || normalized(item.Location).includes(normalizedQuery)
        || normalized(item.EPC_ID).includes(normalizedQuery)
        || normalized(item.Status).includes(normalizedQuery);
    }
    this.viewListData = this.listData.filter(filterExpression);
  }

  hideList(): boolean { return !this.listData || this.listData.length == 0; } 
  searchIsEmpty(): boolean { return this.viewListData.length === 0; }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

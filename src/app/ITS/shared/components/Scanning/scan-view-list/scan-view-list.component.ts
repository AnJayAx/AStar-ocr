import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';
import { PagerSettings } from '@progress/kendo-angular-listview/main';
import { Observable, Subject, take, takeUntil } from 'rxjs';


const SELECT_TEXT = 'Select All';
const UNSELECT_TEXT = 'Unselect All';

@Component({
  selector: 'app-scan-view-list',
  templateUrl: './scan-view-list.component.html',
  styleUrls: ['./scan-view-list.component.scss'],
})
export class ScanViewListComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroyed$: Subject<boolean> = new Subject();
  @ViewChild('listview') listview;
  public pagerSettings: PagerSettings;
  public pageSize: number;
  //moduleName: string = '';

  @Input() listData: IItemInfo[];
  @Input() selectMode: 'single' | 'multiple';
  @Input() isEditable: boolean;
  @Input() isMaxEnabled: boolean;
  @Output() updatedListData: EventEmitter<IItemInfo[]> = new EventEmitter();
  @Output() itemsSelected: EventEmitter<IItemInfo[]> = new EventEmitter();

  viewData: IItemInfo[];

  private selectedItems: IItemInfo[] = [];
  selectionText: string;

  private initPager(): void {
    this.pagerSettings = {
      previousNext: true,
      type: 'input',
    };
    this.pageSize = 50;
  }

  constructor(
    private _scanviewService: ScanViewService,
    private customDialogService: CustomDialogService,
    private ref: ChangeDetectorRef,
    //private _layoutService: LayoutService
  ) {
    this.initPager();
    this.loadSelectionText();
    //this.moduleName = this._layoutService.titleDisplay$.getValue.toString();
  }
  

  ngOnInit(): void {
    this._scanviewService.getItemInfoList()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (items) => {
        if (items.length > 0) {
          this.listData = items;
          this.viewData = [...this.listData];
        } else {
          this.listData = [];
          this.viewData = [];
        }
      },
      error: (error) => { console.error(`Error in scan-view-list: ${error}`); }
    });

  }

  ngOnChanges(): void {
    if (!!this.listData && !!this.listview) { 
      this.viewData = [...this.listData];
      this.initPager();
      this.listview.skip = 0;
      this.selectedItems = [];
    }
  }

  ngAfterViewInit(): void {
    this._scanviewService.getSelectedItemInfoList()
    .pipe(take(1))
    .subscribe({
      next: (items) => { 
        this.selectedItems = items; 
        this.loadSelectionText();
        this.itemsSelected.emit(this.selectedItems);    
        this.ref.detectChanges();
      }
    });
  }

  handleFilterChange(searchInput: string, listview) {
    listview.skip = 0;

    const normalized = (input: string) => { return input.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchInput);

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

    if (normalizedQuery.length == 1) { this.viewData = this.listData.filter(filterSM); }
    else { this.viewData = this.listData.filter(filterExpression); }
    
  }

  showList(): boolean { return !!this.listData && this.listData.length > 0; }

  onDeleteItem(item: IItemInfo): void {
    this.listData = [...this.listData.filter(x => x.EPC_ID !== item.EPC_ID)];
    this.viewData = [...this.viewData.filter(x => x.EPC_ID !== item.EPC_ID)];
    this.updatedListData.emit(this.listData);
  }

  isCheckedItem(dataItem: IItemInfo): Observable<boolean> {
    return this._scanviewService.isCheckedItem(dataItem);
  }

  onClickItem(e: {isSelected: boolean, item: IItemInfo}): void {
    if (e.isSelected) {
      const selectedItem = this.listData.find(item => item.EPC_ID === e.item['EPC_ID']);
      if (!!selectedItem) { 
        if (this.selectMode == 'multiple') {
          this.selectedItems.push(selectedItem); 
        } else {
          this.selectedItems = [selectedItem];
        }
      } else { 
        console.error('Error occurred selectedItem not found', selectedItem);
        return; 
      }
    } else {
      if (this.selectMode == 'multiple') {
        this.selectedItems = this.selectedItems.filter(item => item.EPC_ID !== e.item['EPC_ID']);
      } else {
        this.selectedItems = [];
      }
    }

    this.itemsSelected.emit(this.selectedItems);
    this.loadSelectionText();
  }

  private loadSelectionText(): void {
    if (!!this.selectedItems && this.selectedItems.length != 0) { this.selectionText = UNSELECT_TEXT; }
    else { this.selectionText = SELECT_TEXT; }
  }

  onSelectionBtnClick(): void {
    if (this.selectedItems.length != 0) { this.selectedItems = []; }
    else { this.selectedItems = [...this.listData]; }
    this.itemsSelected.emit(this.selectedItems);
    this.loadSelectionText();
    this.ref.detectChanges();
  }

  onDeleteSelection(): void {
    const dialog$ = this.customDialogService.message(
      'Delete selected items?',
      `${this.selectedItems.length} item(s) selected`,
      [{text: 'Yes', primary: true}, { text: 'No', primary: false}],
      'error');

    dialog$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (res) => {
        if (res.primary) {
          const selectedEpcIds = this.selectedItems.map(x => x.EPC_ID);
          this.listData = [...this.listData.filter(x => !selectedEpcIds.includes(x.EPC_ID))];
          this.viewData = [...this.listData];
          this.selectedItems = [...this.selectedItems.filter(x => !selectedEpcIds.includes(x.EPC_ID))];
          this.updatedListData.emit(this.listData);
          this.itemsSelected.emit(this.selectedItems);
          this.loadSelectionText();
        }
      },
      error: (error) => { console.error(error); }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

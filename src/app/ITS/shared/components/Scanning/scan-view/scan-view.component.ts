import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IScanViewListFilter } from '@its/shared/interfaces/frontend/ScanViewListFilter';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject, filter, switchMap, takeUntil } from 'rxjs';
import { ScanViewService } from './scan-view.service';
import { ScanViewInvalidTagsService } from './scan-view-invalid-tags.service';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';

@Component({
  selector: 'app-scan-view',
  templateUrl: './scan-view.component.html',
  styleUrls: ['./scan-view.component.scss'],
})
export class ScanViewComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  @Input() inclBackBtn: boolean = true;
  @Input() continueOrConfirm: 'continue' | 'confirm' = 'confirm';
  @Input() filterByAnd: IScanViewListFilter[] = []; 
  @Input() filterByOr: IScanViewListFilter[] = []
  @Input() filterOut: IScanViewListFilter[] = []; 

  @Input() isEditable: boolean = false;
  @Input() isMaxEnabled: boolean = true;
  @Input() selectMode: 'single' | 'multiple' = 'multiple';

  itsItems: IItemInfo[] = this._scanviewService.storedItemInfoList;
  @Output() confirmed: EventEmitter<boolean> = new EventEmitter();

  private scannedTags: string[] = [];
  private selectedItems: IItemInfo[] = [];

  constructor(
    private _tagsService: ScannedTagsService,
    private _scanviewService: ScanViewService,
    private ref: ChangeDetectorRef,
    private _itsdialog: ItsDialogService,

    private _invalidtagsService: ScanViewInvalidTagsService,
    private _customdialog: CustomDialogService,
  ) {}

  ngOnInit(): void {
    this._tagsService.scannedTags$             
    .pipe(
      takeUntil(this.destroyed$),
      filter(tags => tags.length > 0),
    )
    .subscribe({
      next: (tags) => {
        this.scannedTags = tags; 
        this.onScanComplete();
      },
      error: (error) => { console.error(error); }
    });
    
    this._invalidtagsService.showInvalidTags$
    .pipe(
      takeUntil(this.destroyed$),
      filter(show => show && this._invalidtagsService.isInvalidTagsAvailable),
      switchMap(() => this._customdialog.invalidTagsDialog(
        `Invalid Tags`, this._invalidtagsService.invalidTagsDisplayHTML,
        [{ text: 'Close', primary: true }], 'warning'
      ))
    )
    .subscribe({
      next: () => {
        this._invalidtagsService.closeInvalidTagsDialog();
        this._invalidtagsService.clearInvalidTags();
      }
    });
  }

  onClear(e) {
    if (e) {
      this.scannedTags = [];
      this.itsItems = [];
      this._invalidtagsService.clearInvalidTags();
      this._scanviewService.clearItemInfoLists();
    }
  }

  onConfirm() {
    if (!this.selectedItemsFound()) {
      this._itsdialog.noTagSelected()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => this.confirmed.emit(false)
      });
    }
    else if (!this.selectedItemsValidated()) {
      this._itsdialog.undefinedValuesFound()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => this.confirmed.emit(false)
      });
    } else {
      this.confirmed.emit(true);
    }
  }

  onUpdateListData(updatedlist: IItemInfo[]) {
    this.itsItems = updatedlist;
    this._scanviewService.setItemInfoList(this.itsItems);
  }

  onItemsSelected(selectedlist: IItemInfo[]) {
    this.selectedItems = selectedlist;
    this._scanviewService.setSelectedItemInfoList(this.selectedItems);
  }

  private selectedItemsValidated(): boolean {
    const lastBalQtys = this.selectedItems.map(item => item.LastBal);
    if (lastBalQtys.includes(null) || lastBalQtys.includes(undefined)) {
      return false;
    }
    return true;
  }

  private selectedItemsFound(): boolean {
    return this.selectedItems.length > 0;
  }

  private onScanComplete(): void {
    this._tagsService.resetTagsService();

    if (this.scannedTags.length > 0) {
      this._scanviewService.getFilteredItemInfoByEPC(this.scannedTags)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (items) => {

          /* append to existing itsList rather than overwrite it */
          const uniqueIdMap = new Map(this.itsItems.map(item => { return [item.EPC_ID, true]; }));
          this.processList(items).forEach(newItem => {
            if (!uniqueIdMap.has(newItem.EPC_ID)) {
              uniqueIdMap.set(newItem.EPC_ID, true);
              this.itsItems.push(newItem);
            }
          });

          this.itsItems = this.itsItems.slice();
          
          this._scanviewService.setItemInfoList(this.itsItems);
          this._invalidtagsService.showInvalidTagsDialog();
          this.ref.detectChanges();
        },
        error: (error) => { console.error(error); }
      });
    }
  }

  /* for module-specific filtering logic */

  private filterForAll(item: IItemInfo, conditions: IScanViewListFilter[]): boolean {
    return conditions.length>0 ? conditions.every(condition => item[condition.property] === condition.value) : true;
  }

  private filterForSome(item: IItemInfo, conditions: IScanViewListFilter[]): boolean {
    return conditions.length>0 ? conditions.some(condition => item[condition.property] === condition.value) : true;
  }

  private filterOutSome(item: IItemInfo, conditions: IScanViewListFilter[]): boolean {
    return conditions.length>0 ? conditions.some(condition => item[condition.property] === condition.value): false;
  }

  private processList(allItems: IItemInfo[]): IItemInfo[] {
    const returnList: IItemInfo[] = [];
    allItems.forEach(item => {
      if (this.filterForAll(item, this.filterByAnd) && this.filterForSome(item, this.filterByOr) && this.filterOutSome(item, this.filterOut)===false) {
        returnList.push(item);
      }
      else {
        if (!this.filterForAll(item, this.filterByAnd)) {
          this._invalidtagsService.appendFilterFailTag(item, this.filterByAnd.filter(condition => item[condition.property] !== condition.value).map(condition => condition.property));
        }
        if (!this.filterForSome(item, this.filterByOr)) {
          this._invalidtagsService.appendFilterFailTag(item, this.filterByOr.map(condition => condition.property));
        }
        if (this.filterOutSome(item, this.filterOut)) {
          this._invalidtagsService.appendFilterFailTag(item, this.filterOut.filter(condition => item[condition.property] === condition.value).map(condition => condition.property));
        }
      }
    });
    return returnList;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

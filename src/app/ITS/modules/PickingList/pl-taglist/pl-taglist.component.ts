import { Component, OnDestroy, OnInit } from "@angular/core";
import { CustomDialogService } from "@dis/services/message/custom-dialog.service";
import { IPLTagItem } from "@its/shared/interfaces/frontend/PLTagItem";
import { Subject, takeUntil } from "rxjs";
import { FifoType } from "../pickinglist.constants";
import { PlFifoService } from "../services/pl-fifo.service";
import { PlSelectedOrderService } from "../services/pl-selected-order.service";
import { PlSelectedTaglistService } from "@its/modules/PickingList/services/pl-selected-taglist.service";
import { PlScanService } from "../services/pl-scan.service";
import { LayoutService } from "@dis/services/layout/layout.service";
import { Router } from "@angular/router";

const SELECT_TEXT = 'Select All';
const UNSELECT_TEXT = 'Unselect All';

@Component({
  selector: 'app-pl-taglist',
  templateUrl: './pl-taglist.component.html',
  styleUrls: ['./pl-taglist.component.scss'],
  providers: [ PlFifoService ]
})
export class PlTaglistComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  private currentFIFO: FifoType;

  private pickingID: string;
  tagItems: IPLTagItem[];
  private selectedTagItems: IPLTagItem[] = [];
  selectionText: string;

  constructor(
    private _pltaglistService: PlSelectedTaglistService,
    private customDialogService: CustomDialogService,
    private _selectedorderService: PlSelectedOrderService,
    private _plfifoService: PlFifoService,
    private _layoutService: LayoutService,
    private router: Router,
  ) {
    this.loadSelectionText();

    this._layoutService.changeTitleDisplayAndSetNavBackPath('Tag List', 'pl-list');

    // this._plfifoService.getCurrentFIFO().pipe(takeUntil(this.destroyed$)).subscribe({
    //   next: (fifo) => { this.currentFIFO = fifo; }
    // });
  }

  ngOnInit(): void {
    this._pltaglistService.selectedTagList$.pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (list) => {
        this.tagItems = list;
        this.selectedTagItems = [];
        if (this.tagItems.length > 0) { this.pickingID = this.tagItems[0]._id; }
        console.log('[pl-taglist] selectedTagList$', this.tagItems);
      },
      error: (error) => { console.error(error); }
    });
  }

  isSelectedItem(dataItem: IPLTagItem): boolean {
    return this.selectedTagItems.map(item => item.EPC_ID).includes(dataItem.EPC_ID);
  }

  onClickItem(e: any, dataItem: IPLTagItem): void {
    if (e) {
      const selectedItem = this.tagItems.find(item => item.EPC_ID === dataItem['EPC_ID']);
      if (!!selectedItem) { this.selectedTagItems.push(selectedItem); }
      else { console.error('Error occurred selectedItem not found', selectedItem); return; }
    }
    else { this.selectedTagItems = [...this.selectedTagItems].filter(item => item.EPC_ID !== dataItem['EPC_ID']); }
    this.loadSelectionText();
    console.log('[pl-taglist] selected tags updated', this.selectedTagItems);
  }

  onSelectionBtnClick(): void {
    if (this.selectedTagItems.length != 0) { this.selectedTagItems = []; }
    else { this.selectedTagItems = [...this.tagItems]; }
    this.loadSelectionText();
  }

  onSelectionChange(selected: boolean, tag: IPLTagItem): void {
    if (selected) {
      this.selectedTagItems.push(tag);
    } else {
      const removeIdx = this.selectedTagItems.findIndex(t => t.EPC_ID === tag.EPC_ID);
      if (removeIdx === -1) {
        console.error('Checked item not found in selected items', tag);
        return;
      }
      this.selectedTagItems.splice(removeIdx, 1);
    }
  }

  onDeleteSelection(): void {
    const dialog$ = this.customDialogService.message(
      'Delete selected items?',
      `${this.selectedTagItems.length} item(s) selected`,
      [{ text: 'No', primary: false}, {text: 'Yes', primary: true}],
      'error'
    );

    const isUnselectedItem = (tag: IPLTagItem) => {
      return !this.selectedTagItems.map(s => s.EPC_ID).includes(tag.EPC_ID);
    }

    dialog$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (res) => {
        if (res.primary) {
          this.tagItems = [...this.tagItems.filter(x => isUnselectedItem(x))];
          this.selectedTagItems = [];
          
          this._pltaglistService.updateSelectedTagList(this.tagItems);
          this._selectedorderService.updateOrderItemOnPickedItemDeletion(this.tagItems, this.pickingID);
        }
      },
      error: (error) => { console.error(error); }
    });
  }

  onDone(): void {
    this.router.navigateByUrl('/pl-list');
  }

  private loadSelectionText(): void {
    if (this.selectedTagItems?.length > 0) { this.selectionText = UNSELECT_TEXT; }
    else { this.selectionText = SELECT_TEXT; }
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

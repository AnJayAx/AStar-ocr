import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Subject } from 'rxjs';
import { ItemInfoComponent } from '@its/shared/components/item-info/item-info.component';
import { StListService } from '../../services/st-list.service';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-st-item-card',
  templateUrl: './st-item-card.component.html',
  styleUrls: ['./st-item-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StItemCardComponent implements OnInit, OnDestroy {
  binIcon = faTrashCan;
  private destroyed$: Subject<boolean> = new Subject();

  @Input() index: number;
  @Input() stItem: ISTItem;

  @Input() editable: boolean = false; 
  @Input() deletable: boolean = false;
  @Input() enableItemInfo: boolean = false;
  @Input() showSTLastBal: boolean = false;  
 
  printPrevBal: string;
  printCurrentBal: string;

  constructor(
    private dialogService: DialogService,
    private _stlistService: StListService,
  ) {}

  showNumericTextbox(): boolean {
    return this.stItem.SM.toLowerCase() === 'm' && this.editable;
  }

  ngOnInit(): void {
    this.init();
  }

  private init() {
    this.printPrevBal = this.stItem.Prev_Bal.toFixed(2); 
    this.printCurrentBal = this.stItem.Current_Bal?.toFixed(2);

    if (this.stItem['ST_Qty'] === null) {
      this.stItem['ST_Qty'] = !!this.stItem['Current_Bal'] ? this.stItem['Current_Bal'] : null;
      if (this.editable) { this._stlistService.editSTItem(this.stItem); }
    }
  }

  onValueChange(updatedSTQty: number) { /* editable=true */
    this.stItem['ST_Qty'] = updatedSTQty;
    this._stlistService.editSTItem(this.stItem);
  }

  onSelect() {
    console.log('Selected:', this.stItem.EPC_ID);
    if (this.enableItemInfo) {
      const dialogRef: DialogRef = this.dialogService.open({
        title: 'Item Information',
        content: ItemInfoComponent,
        cssClass: 'item-info'
      });

      const itemInfoDialog = dialogRef.content.instance as ItemInfoComponent;
      itemInfoDialog.itemEPC = this.stItem.EPC_ID;
      itemInfoDialog.itemAssetID = this.stItem.Asset_ID;
    }
  }

  onRemove() {
    this._stlistService.removeSTItem(this.stItem);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

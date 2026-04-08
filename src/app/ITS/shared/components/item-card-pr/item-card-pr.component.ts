import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Component({
  selector: 'app-item-card-pr',
  templateUrl: './item-card-pr.component.html',
  styleUrls: ['./item-card-pr.component.scss']
})
export class ItemCardPrComponent implements OnInit {
  binIcon = faTrashCan;

  @Input() item: IItemInfo;
  @Input() index: number;
  @Input() isEditable: boolean = false;
  
  @Input() isSelectable: boolean = true;
  @Input() isSelected: boolean = false;
  @Input() isDeselectOnly: boolean = false;
  @Input() preventHighlightEvent: boolean = false;

  @Input() showDefaultDeleteMsg: boolean = true;
  @Input() isDeletionDisabled: boolean = false; /* determines whether item deletion is allowed */
  @Input() isMaxEnabled: boolean = true; /* determines whether max is imposed on qty numeric textbox */

  @Output() itemRemoved: EventEmitter<IItemInfo> = new EventEmitter();
  @Output() itemClicked: EventEmitter<{ isSelected: boolean, item: IItemInfo}> = new EventEmitter();

  SM: string;
  sLastBal: string;
  max: number;
  //RQty: number;
  constructor(
    private _toast: ToastService
  ) {}

  ngOnInit(): void {
    this.SM = this.item['IsIndividual'].toUpperCase();
    
    this.max =  Number(this.item['Remarks6']);
    // if (this.SM === 'M' && this.isEditable && this.isMaxEnabled) {
    //   /* in this case, sLastBal value should reflect the remaining balance after deducting the user's LastBal qty */
    //   this.sLastBal = '0.00';
    // } else {
    // this.sLastBal = Number(this.item['Remarks6']).toFixed(2);
    // }
    this.sLastBal = '0.00';
  }

  onRemove() {
    this.itemRemoved.emit(this.item);
    if (this.showDefaultDeleteMsg) {
      this._toast.info(`${this.item.Asset_No} deleted`);
    }
  }

  onFocus() {
    //this.updateMax;
  }

  onLastBalChange(RQty: any) { 
    const numValue = Number(RQty);
    // if (numValue > this.max) {
    //   this.item.Remarks6 = this.max.toString();
    //   this.sLastBal = this.max.toString();
    //   }
    //   else
    //   {this.sLastBal = RQty}  
    this.sLastBal = (this.max - Number(this.item.Remarks6)).toFixed(2);
  }


  sanitizeNullString(value: string) {
    return value?.length < 1 ? '-' : value;
  }

  onSelect() {
    console.log('[item-card-pr] onSelect: BEFORE ', { isSelected: this.isSelected, item: this.item });

    if (this.isSelectable && this.preventHighlightEvent === false) {
      this.isSelected = !this.isSelected;
    } 
    else if (this.preventHighlightEvent) {
      console.log('[item-card-pr] highlight event prevented');
    }
    else {
      console.log('[item-card-pr] selection disabled');
    }

    if (this.isSelectable) {
      this.itemClicked.emit({isSelected: this.isSelected, item: this.item});
    }

    console.log('[item-card-pr] onSelect: AFTER ', { isSelected: this.isSelected, item: this.item });
  }


}

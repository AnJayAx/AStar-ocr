import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { IProductionTravelerItemInfo } from '@its/shared/interfaces/backend/ProductionTravelerItemInfo';
import { PtItemCardStoreService } from '../../services/pt-item-card-store.service';

@Component({
  selector: 'app-pt-item-card',
  templateUrl: './pt-item-card.component.html',
  styleUrls: ['./pt-item-card.component.scss'],
})
export class PtItemCardComponent implements OnInit, OnDestroy {
  binIcon = faTrashCan;

  @Input() item: IProductionTravelerItemInfo;
  @Input() isSelected: boolean = false;

  @Output() itemRemoved: EventEmitter<IProductionTravelerItemInfo> = new EventEmitter();
  @Output() itemClicked: EventEmitter<{ isSelected: boolean, item: IProductionTravelerItemInfo}> = new EventEmitter();

  SM: string;
  initialLastBal: number;
  sLastBal: string;
  max: number;

  constructor(
    private _toast: ToastService,
    private _itemstore: PtItemCardStoreService
  ) { }

  ngOnInit(): void {
    this.SM = this.item['IsIndividual'].toUpperCase();

    this.initialLastBal = this._itemstore.getInitialLastBal(this.item['EPC_ID']) ?? this.item['LastBal'];
    this._itemstore.setInitialLastBal(this.item['EPC_ID'], this.initialLastBal);
    this.max = this.initialLastBal;
    
    if (this.max > 1) { this.onLastBalChange(); }
    else { this.sLastBal = this.initialLastBal.toFixed(2); }

    console.log(`[pt-item-card] ${this.item.EPC_ID} initialLastBal`, this.initialLastBal);

  }

  get CoOpId(): string {
    const coOpAc = this.item?.CO.OpAc ? this.item.CO.OpAc : '-';
    const coOpShortTxt = this.item?.CO.Operation_short_text ? this.item.CO.Operation_short_text : '-';
    return `${coOpAc} ${coOpShortTxt}`;
  }

  get NoOpId(): string {
    const noOpAc = this.item?.NO.OpAc ? this.item.NO.OpAc : '-';
    const noOpShortTxt = this.item?.NO.Operation_short_text ? this.item.NO.Operation_short_text : '-';
    return `${noOpAc} ${noOpShortTxt}`;
  }

  onRemove() {
    this.itemRemoved.emit(this.item);
    this._itemstore.clearInitialLastBal(this.item['EPC_ID']);
    this._toast.info(`${this.item.Asset_ID} deleted`);
  }

  onLastBalChange() {
    console.log('[pt-item-card] onLastBalChange', this.item);
    this.sLastBal = (this.max - this.item.LastBal).toFixed(2);
  }

  sanitizeNullString(value: string) {
    return value?.length < 1 ? '-' : value;
  }

  onSelect() {
    this.isSelected = !this.isSelected;
    console.log('[pt-item-card] onSelect', {isSelected: this.isSelected, item: this.item});
    this.itemClicked.emit({isSelected: this.isSelected, item: this.item});
  }

  ngOnDestroy(): void {
    console.log(`[pt-item-card] ${this.item.EPC_ID} destroyed`);
  }
}
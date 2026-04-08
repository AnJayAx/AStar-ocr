import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IPLTagItem } from '@its/shared/interfaces/frontend/PLTagItem';
import { Subject, takeUntil } from 'rxjs';
import { FifoType } from '../../pickinglist.constants';
import { PlFifoService } from '../../services/pl-fifo.service';
import { PlSelectedOrderService } from '../../services/pl-selected-order.service';

@Component({
  selector: 'app-pl-tagitem-card',
  templateUrl: './pl-tagitem-card.component.html',
  styleUrls: ['./pl-tagitem-card.component.scss'],
  providers: [ PlFifoService ]
})
export class PlTagitemCardComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  private currentFIFO: FifoType;

  @Input() item: IPLTagItem;
  private currPickingMax: number;

  isM: boolean = false;
  max: number;
  initialRemainingQty: number;
  
  @Input() isSelected: boolean = false;
  isDisabled: boolean = false;

  @Output() itemClicked: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private _selectedorderService: PlSelectedOrderService,
    private _plfifoService: PlFifoService,
  ) {
    // this._plfifoService.getCurrentFIFO().pipe(takeUntil(this.destroyed$)).subscribe({
    //   next: (fifo) => { this.currentFIFO = fifo; }
    // });
  }

  ngOnInit(): void {   
    if (this.item.LastBal <= 0) {
      this.isDisabled = true; /* No balance to be picked from */
    }
 
    this.isM = this.item.IsIndividual.toLowerCase() === 'm';

    this.initialRemainingQty = this._selectedorderService.getTagItemInitialRemainingQty(this.item._id);
  }

  onBlur() {
    this._selectedorderService.updateOrderItemOnPickedQtyChange(this.item);
  }

  onFocus() {
    this.currPickingMax = this._selectedorderService.getTagItemPickingMax(this.item);
    this.setMax();
  }

  onPickedQtyChange(pickedQty) {
    if (!pickedQty) { pickedQty = 0; }  /* no null values allowed */
    this.item._picked = pickedQty;
    this.item._balance = this.item.LastBal - this.item._picked;
    this.currPickingMax = this._selectedorderService.getTagItemPickingMax(this.item);
    this.setMax();
  }

  private setMax(): void { /* maximum allowable picking qty -- either max out qtyAvailable or required picking qty */
    this.max = this.currPickingMax <= this.item.LastBal ? this.currPickingMax : this.item.LastBal;
  }

  onItemClick(): void {
    this.isSelected = !this.isSelected;
    this.itemClicked.emit(this.isSelected);
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

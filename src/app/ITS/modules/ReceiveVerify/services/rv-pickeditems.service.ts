import { Injectable } from '@angular/core';
import { IReceiveVerifyOrderPickedLine } from '@its/shared/interfaces/backend/SPT_Doc/ReceiveVerifyOrder';
import { IRVOrderItem } from '@its/shared/interfaces/frontend/RVOrderItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { RvOrderService } from './rv-order.service';

@Injectable({
  providedIn: 'root'
})
export class RvPickeditemsService {

  private selectedPickedItemsSubject: BehaviorSubject<IReceiveVerifyOrderPickedLine[]> = new BehaviorSubject([]);
  public selectedPickedItems$: Observable<IReceiveVerifyOrderPickedLine[]> = this.selectedPickedItemsSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private _rvorderService: RvOrderService,
    private _itsService: ItsServiceService,
  ) {
    this.loadDefaultPickedItems();
  }

  private loadDefaultPickedItems(): void {
    this._rvorderService.selectedOrderItem$.pipe(
      filter(order => !!order),
      switchMap(selectedOrder => this.getPickedItemsByOrder(selectedOrder))
    ).subscribe({
      next: pickedItems => {
        this.selectedPickedItemsSubject.next(pickedItems);
      }
    });
  }

  getPickedItemsByOrder(orderItem: IRVOrderItem): Observable<IReceiveVerifyOrderPickedLine[]> {
    return this._itsService.getPickedItemByOrderID(orderItem.value);
  }
}

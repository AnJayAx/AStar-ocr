import { Injectable } from '@angular/core';
import { IRVOrderItem } from '@its/shared/interfaces/frontend/RVOrderItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RvOrderService {

  private selectedOrderItemSubject: BehaviorSubject<IRVOrderItem> = new BehaviorSubject(undefined);
  public selectedOrderItem$: Observable<IRVOrderItem> = this.selectedOrderItemSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private _itsService: ItsServiceService
  ) {}

  reset() {
    this.selectedOrderItemSubject.next(undefined);
  }

  getLatestSelectedOrderItem(): IRVOrderItem {
    return this.selectedOrderItemSubject.getValue();
  }

  isValidOrderItem(orders: IRVOrderItem[]): boolean {
    const selectedOrder = this.selectedOrderItemSubject.getValue();
    if (!selectedOrder) { return false; }
    const validValues = orders.map(order => order.value);
    return validValues.includes(selectedOrder.value);
  }

  getAvailableOrders(): Observable<IRVOrderItem[]> {
    return this._itsService.getAvailableReceiveVerifyOrders().pipe(
      map(rvOrders => {
        return rvOrders.map(rvOrder => { 
          const orderType = rvOrder.isNormalPicking ? 'PDO' : 'PT';
          return { 
            label: `${rvOrder.Order_No} (${orderType}/${rvOrder.Status})`, 
            value: rvOrder.Verification_ID, 
            isNormalPicking: rvOrder.isNormalPicking,
            destinationLocation: rvOrder.Destination_Location,
            destinationLocationID: rvOrder.Destination_Location_ID 
          }; 
        });
      })
    );
  }

  setOrder(orderItem: IRVOrderItem): void {
    console.log('DEBUG setOrder', orderItem);
    this.selectedOrderItemSubject.next(orderItem);
  }
}

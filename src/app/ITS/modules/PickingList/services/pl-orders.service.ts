import { Injectable } from '@angular/core';
import { IPLOrderItem } from '@its/shared/interfaces/frontend/PLOrderItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { RefreshService } from '@its/shared/services/refresh.service';
import { BehaviorSubject, Observable, Subject, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { PickingListUtils } from '../pickinglist-utils';
import { PlResetService } from './pl-reset.service';
import { IPlOrderInfo } from '@its/shared/interfaces/backend/SPT_Doc/PlOrderInfo';

@Injectable({
  providedIn: 'root'
})
export class PlOrdersService {
  private ordersSubject: BehaviorSubject<IPLOrderItem[]> = new BehaviorSubject(undefined);
  public orders$: Observable<IPLOrderItem[]> = this.ordersSubject.asObservable();

  private ordersInfoListSubject: BehaviorSubject<IPlOrderInfo[]> = new BehaviorSubject(undefined);
  public ordersInfoList$: Observable<IPlOrderInfo[]> = this.ordersInfoListSubject.asObservable();

  constructor(
    private _itsService: ItsServiceService,
    private _refresh: RefreshService,
    private _resetService: PlResetService,
  ) {
    // this._refresh.refreshToken$.pipe(
    //   takeUntil(this._resetService.plModuleDestroyed$),
    //   switchMap(() => this._itsService.getAvailableOrders()),
    //   tap(orders => console.log('[pl-orders service] getAvailableOrders', orders)),
    //   map(orders => { return orders.map(order => PickingListUtils.orderToOrderItem(order)); }),
    // ).subscribe({
    //   next: (incomingOrders) => {
    //     this.ordersSubject.next(incomingOrders);
    //   }
    // });
    
    this._refresh.refreshToken$.pipe(
      takeUntil(this._resetService.plModuleDestroyed$),
      switchMap(() => this._itsService.getAvailableOrdersInfo()),
      tap(orders => console.log('[pl-orders service] getAvailableOrdersNew', orders)),
    ).subscribe({
      next: (incomingOrderInfoList) => this.ordersInfoListSubject.next(incomingOrderInfoList)
    })
  }
}

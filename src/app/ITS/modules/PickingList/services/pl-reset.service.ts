import { Injectable } from '@angular/core';
import { PlSelectedOrderService } from './pl-selected-order.service';
import { PlSelectedTaglistService } from './pl-selected-taglist.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlResetService {

  public plModuleDestroyed$: Subject<boolean> = new Subject();

  constructor(
    private _plselectedorderService: PlSelectedOrderService,
    private _plselectedtaglistService: PlSelectedTaglistService,
  ) { }

  resetAndDestroyPlModule() {
    this.resetPickingList();
    this.destroyPlModule();
  }

  initPlModule(): void { 
    this.initPickingList();
    this.plModuleDestroyed$ = new Subject(); 
  }

  destroyPlModule(): void {
    console.log('DEBUG pl module destroyed');
    this.plModuleDestroyed$.next(true);
    this.destroyPickingList();
  }

  private initPickingList() {
    this._plselectedorderService.init();
  }

  private resetPickingList() {
    this._plselectedorderService.reset();
    this._plselectedtaglistService.reset();
  }

  private destroyPickingList() {
    this._plselectedorderService.destroy();
  }
}

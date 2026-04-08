import { Injectable } from '@angular/core';
import { StFiltersStoreService } from './st-filters-store.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StResetService {

  public destroyed$: Subject<boolean> = new Subject();

  constructor(
    private _stfilterStore: StFiltersStoreService,
  ) { }

  resetAndDestroyStModule(): void {
    this._stfilterStore.clearAllStoredFilters();
    this.destroyed$.next(true);
  }
}

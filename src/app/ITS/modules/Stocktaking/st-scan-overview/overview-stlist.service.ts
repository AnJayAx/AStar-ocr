import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { map, Observable } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { StUtilsService } from '../services/st-utils.service';

@Injectable()
export class OverviewStlistService {

  constructor(
    private _stutilsService: StUtilsService,
    private _stlistService: StListService,
  ) {}

  getSubmittedList(): Observable<ISTItem[]> {
    return this._stlistService.defaultList$.pipe(
      map(stlist => stlist.filter(item => this._stutilsService.isSubmittedItem(item)))
    );
  }

  getPendingList(): Observable<ISTItem[]> {
    return this._stlistService.workingSTList$.pipe(
      map(stList => { return stList.filter(item => this._stutilsService.isPendingItem(item))})
    );
  }
}

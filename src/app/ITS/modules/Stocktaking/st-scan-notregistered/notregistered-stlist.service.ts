import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { StUtilsService } from '../services/st-utils.service';
import { STStatus } from '../stocktaking.constants';

@Injectable()
export class NotregisteredStlistService {

  constructor(
    private _stlistService: StListService,
    private _stutilsService: StUtilsService,
  ) {}

  getNotRegisteredList(): Observable<ISTItem[]> {
    return this._stlistService.workingSTList$.pipe(
      map(stlist => this._stutilsService.getSTListBySTStatus(stlist, STStatus.NotRegistered))
    );
  }

  getNotRegisteredTagList(): Observable<string[]> {
    return this._stlistService.workingSTList$.pipe(
      map(stlist => this._stutilsService.getSTListBySTStatus(stlist, STStatus.NotRegistered)),
      map(notregisteredlist => notregisteredlist.map(item => item.EPC_ID))
    );
  }

}

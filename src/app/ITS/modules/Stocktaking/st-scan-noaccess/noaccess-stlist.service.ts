import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { map, Observable } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { StUtilsService } from '../services/st-utils.service';
import { STStatus } from '../stocktaking.constants';

@Injectable()
export class NoaccessStlistService {

  constructor(
    private _stlistService: StListService,
    private _stutilsService: StUtilsService,
  ) {}

  getNoAccessList(): Observable<ISTItem[]> {
    return this._stlistService.workingSTList$.pipe(
      map(stlist => this._stutilsService.getSTListBySTStatus(stlist, STStatus.NoAccess))
    );
  }
}

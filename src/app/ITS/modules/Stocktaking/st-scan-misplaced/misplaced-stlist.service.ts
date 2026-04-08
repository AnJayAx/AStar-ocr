import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { map, Observable, tap } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { StUtilsService } from '../services/st-utils.service';
import { STStatus } from '../stocktaking.constants';

@Injectable()
export class MisplacedStlistService {

  constructor(
    private _stlistService: StListService,
    private _stutilsService: StUtilsService,
  ) {}
  
  getMisplacedList(): Observable<ISTItem[]> {
    return this._stlistService.workingSTList$.pipe(
      tap(stlist => console.log('getmisplacedlist stlist', stlist)),
      map(stlist => this._stutilsService.getSTListBySTStatus(stlist, STStatus.Misplaced))
    );
  }

}

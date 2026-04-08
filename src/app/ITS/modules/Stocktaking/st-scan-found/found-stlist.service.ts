import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { map, Observable, tap } from 'rxjs';
import { StListService } from '../services/st-list.service';
import { StUtilsService } from '../services/st-utils.service';
import { STStatus } from '../stocktaking.constants';

@Injectable()
export class FoundStlistService {

  foundList$: Observable<ISTItem[]> = this._stlistService.workingSTList$.pipe(
    tap(stList => console.log('[found-stlist svc] working list', stList)),
    map(stList => this._stutilsService.getSTListBySTStatus(stList, STStatus.Found))
  );

  constructor(
    private _stlistService: StListService,
    private _stutilsService: StUtilsService,
  ) {}
}

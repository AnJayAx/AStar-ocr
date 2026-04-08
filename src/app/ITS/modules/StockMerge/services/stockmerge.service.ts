import { Injectable } from '@angular/core';
import { IScrapItem } from '@its/shared/interfaces/frontend/scrapItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockmergeService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsDialog: ItsDialogService,
  ) { }

  postStockMerge(updateEpcId: string, mergeFromItems: IScrapItem[]): Observable<any> {
    return this._itsService.postStockMergeAndScrap(updateEpcId, mergeFromItems).pipe(switchMap(res => this._itsDialog.postByHH(res)));
  }
}

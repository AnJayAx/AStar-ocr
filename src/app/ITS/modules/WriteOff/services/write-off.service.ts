import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IScrapItem } from '@its/shared/interfaces/frontend/scrapItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WriteOffService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
  ) { }

  getWriteOffListByDocNo(documentNo: string): Observable<IItemInfo[]> {
    return this._itsService.getWriteOffListByDocNo(documentNo);
  }

  postWriteOffList(writeOffItems: IScrapItem[]): Observable<any> {
    return this._itsService.postScrap(writeOffItems).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }
}

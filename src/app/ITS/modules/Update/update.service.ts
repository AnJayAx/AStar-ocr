import { Injectable } from '@angular/core';
import { UpdateItem } from '@its/shared/interfaces/frontend/updateItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, switchMap } from 'rxjs';

@Injectable()
export class UpdateService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService,
  ) { }

  postUpdate(assetID: number, userID: string, updateItem: UpdateItem): Observable<any> {
    return this._itsService.modifyItem(assetID, userID, updateItem).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postUpdateArr(userID: string, updateItems: UpdateItem[]): Observable<any> {
    return this._itsService.modifyItems(userID, updateItems).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }
  
  resetTags() {
    this._tagsService.resetTagsService();
  }
}

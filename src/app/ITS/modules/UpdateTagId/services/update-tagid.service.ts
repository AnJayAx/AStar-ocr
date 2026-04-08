import { Injectable } from '@angular/core';
import { UpdateItem } from '@its/shared/interfaces/frontend/updateItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, filter, map, switchMap, tap } from 'rxjs';
import { UpdateTagidStoreService } from './update-tagid-store.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Injectable()
export class UpdateTagidService {

  constructor(
    private _itsService: ItsServiceService,
    private _tagsService: ScannedTagsService,
    private _itsdialog: ItsDialogService,
    private _store: UpdateTagidStoreService,
  ) { }

  incomingScannedUpdateItem$: Observable<IItemInfo[]> =
    this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      map(tags => tags[tags.length-1]),
      tap(tag => this._store.setScannedTag(tag)),
      switchMap(tag => this._itsService.postItemsByEpcId([{"EPC_ID": tag}]))
    );
  

  postUpdate(assetID: number, userID: string, updateItem: UpdateItem): Observable<any> {
    return this._itsService.modifyItem(assetID, userID, updateItem).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  resetTags() {
    this._tagsService.resetTagsService();
  }

}


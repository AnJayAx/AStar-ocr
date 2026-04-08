import { Injectable } from '@angular/core';
import { IRelocationItem } from '@its/shared/interfaces/frontend/relocationItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelocationService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService,
  ) { }

  postRelocation(relocationItems: IRelocationItem[], newLocID: number): Observable<any> {
    return this._itsService.postRelocation(relocationItems, newLocID).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  clearTags() {
    this._tagsService.resetTagsService();
  }
}

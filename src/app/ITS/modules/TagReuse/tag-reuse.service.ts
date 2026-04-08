import { Injectable } from '@angular/core';
import { TagReuseItem } from '@its/shared/interfaces/backend/TagReuseItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagReuseService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService
  ) { }

  postTagReuse(docNo: string, tagReuseItem: TagReuseItem): Observable<any> {
    return this._itsService.postTagReuse(docNo, tagReuseItem).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  resetTags() {
    this._tagsService.resetTagsService();
  }
}

import { Injectable } from '@angular/core';
import { ICheckInOutItem } from '@its/shared/interfaces/frontend/CheckInOutItem';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, switchMap} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductreceiveService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService
  ) { }

  clearTags() {
    this._tagsService.resetTagsService();
  }

  containsSAvailableItem(tagItems: ISelectedTag[]): boolean {
    let returnBool = false;
    tagItems.forEach(tag => {
      if (tag.SM.toLowerCase() === 's' && tag.Asset_StatusName.toLowerCase() === 'available') {
        returnBool = true;
        return;
      }
    });
    return returnBool;
  }

  containsCheckOut(tagItems: ISelectedTag[]): boolean {
    let returnBool = false;
    tagItems.forEach(tags => {
      if (tags.Asset_StatusName.toLowerCase() === 'notavailable') {
        returnBool = true;
      }
    });
    return returnBool;
  }

  postCheckIn(checkInItems: ICheckInOutItem[]): Observable<any> {
    return this._itsService.postCheckIn(checkInItems).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postCheckOut(checkOutItems: ICheckInOutItem[]): Observable<any> {
    return this._itsService.postCheckOut(checkOutItems).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }
}

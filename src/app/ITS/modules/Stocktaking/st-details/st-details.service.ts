import { Injectable } from '@angular/core';
import { ISTItemCategory } from '@its/shared/interfaces/backend/SPT_Doc/STItemCategory';
import { ISTItemLocation } from '@its/shared/interfaces/backend/SPT_Doc/STItemLocation';
import { ISTItemPIC } from '@its/shared/interfaces/backend/SPT_Doc/STItemPIC';
import { ISTItemRefNo } from '@its/shared/interfaces/backend/SPT_Doc/STItemRefNo';
import { STNoListItem } from '@its/shared/interfaces/frontend/STNoListItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { forkJoin, Observable } from 'rxjs';
import { StSettingsService } from '../services/st-settings.service';

@Injectable()
export class StDetailsService {

  constructor(
    private _itsService: ItsServiceService,
    private _stsettingsService: StSettingsService,
  ) { }

  getSTDetailsFormFieldData(selectedSTNo: string):
  Observable<{
    category: ISTItemCategory[];
    location: ISTItemLocation[];
    pic: ISTItemPIC[];
    refNo: ISTItemRefNo[];
  }> {
    const stDetailsData$ = forkJoin({
      category: this._itsService.getSTItemCategory(selectedSTNo),
      location: this._itsService.getSTItemLocation(selectedSTNo),
      pic: this._itsService.getSTItemPIC(selectedSTNo),
      refNo: this._itsService.getSTItemRefNo(selectedSTNo),
    });

    return stDetailsData$;
  }

  getInitialSelectedStNoListItem(list: STNoListItem[]): STNoListItem {
    const storedSelectedStNoListItem = this._stsettingsService.getStoredSelectedStNoListItem(list);
    const selectedStNoListItem = !!storedSelectedStNoListItem ? storedSelectedStNoListItem as STNoListItem : list[0];
    return selectedStNoListItem;
  }
}

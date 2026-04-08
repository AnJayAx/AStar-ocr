import { Injectable } from '@angular/core';
import { Utils } from '@its/shared/classes/utils';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { filter, map, Observable, Subject } from 'rxjs';
import { FifoType } from '../pickinglist.constants';
import { FIFO_SETTING_KEY } from '@its/shared/constants/lptkeys.constants';
@Injectable()
export class PlFifoService {
  private destroyed$: Subject<boolean> = new Subject();

  // private currentFIFOSetting: FifoType = FifoType.Off;
  // private currentFifoSubject: BehaviorSubject<FifoType> = new BehaviorSubject(FifoType.Off);
  // public currentFifo$: Observable<FifoType> = this.currentFifoSubject.asObservable();
  
  constructor(
    private _itsService: ItsServiceService
  ) {
    // this._itsService.getITSSettingByKey(FIFO_SETTING_KEY)
    // .pipe(
    //   takeUntil(this.destroyed$),
    //   map(res => Utils.getSingleITSSettingVal(res)),
    //   filter(settingStr => this.verifyFifoSettingVal(settingStr))
    // )
    // .subscribe({
    //   next: (setting) => {
    //     this.currentFIFOSetting = setting as FifoType;
    //     this.currentFifoSubject.next(this.currentFIFOSetting);
    //   },
    //   error: (error) => { console.error(error); }
    // });
  }

  // getCurrentFIFO(): Observable<FifoType> {
  //   return this._itsService.getITSSettingByKey(FIFO_SETTING_KEY).pipe(
  //     map(response => Utils.getSingleITSSettingVal(response)),
  //     filter(settingsString  => this.verifyFifoSettingVal(settingsString)),
  //     map(fifo => fifo as FifoType)
  //   );
  // }

  // getCurrentFIFO(): FifoType {
  //   return this.currentFIFOSetting;
  // }

  private verifyFifoSettingVal(itssettingVal: string): boolean {
    return Object.values(FifoType).map(v => v.toString()).includes(itssettingVal);
  }

}

import { Injectable, Optional } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { selectedScanModeKey } from '@its/shared/constants/storagekeys.constants';
import { Observable, BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ScanBarcodeService } from './scan-barcode.service';
import { ConfigRfidService } from './config-rfid.service';
import { BeeperVolumeLevels } from '../constants/scan.enum';
//import { ScanRfidService } from './scan-rfid.service';

export enum ScanMode {
  RFID = 'RFID', Barcode = 'Barcode'
}

@Injectable({
  providedIn: 'root'
})
export class ScanmodeService {
  private destroyed$: Subject<boolean> = new Subject();
  private isCameraValid: boolean;

  private selectedScanMode: ScanMode = ScanMode.RFID;
  private scanModeSubject: BehaviorSubject<ScanMode> = new BehaviorSubject<ScanMode>(this.selectedScanMode);
  public scanMode$: Observable<ScanMode> = this.scanModeSubject.asObservable();

  constructor( 
    private _storage: StorageService,
    @Optional() private _scanbarcodeService: ScanBarcodeService,
    @Optional() private _configRfidService: ConfigRfidService,
    //private _scanRfidService: ScanRfidService,  
  ) {
    this._scanbarcodeService?.cameraValid$.pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (isCameraValid: boolean) => { 
        this.isCameraValid = isCameraValid; 
      },
      error: (error) => { console.error(error); }
    });
  }

  setSelectedScanMode(selectedMode: ScanMode) {
    this.selectedScanMode = selectedMode;
    this._storage.setItem(selectedScanModeKey, this.selectedScanMode.toString());
    this.scanModeSubject.next(this.selectedScanMode);
    this.onScanModeSelected();
  }

  get currentScanMode(): ScanMode { return this.selectedScanMode; }

  private onScanModeSelected() {
    if (this.selectedScanMode === ScanMode.RFID) {
      /* Revert to saved beeper volume level */
      this._configRfidService.setDefaultBeeperVolume();

      if (!this.isCameraValid) {
        this._scanbarcodeService.disconnect();
      }
      //this._scanbarcodeService.disconnect(); 
    } else {
      /* Mute RFID beeper when in non-RFID scan mode */
      this._configRfidService.setBeeperVolume(BeeperVolumeLevels.QUIET, false);

      // if (!this.isCameraValid) {
      //   this._scanbarcodeService.connectReader();
      // }
      this._scanbarcodeService.connectReader().subscribe();
    }


  }


// private onScanModeSelected() {
//   if (this.selectedScanMode === ScanMode.RFID) {
//     this._configRfidService.setDefaultBeeperVolume();

//     // 先关 barcode，避免抢 trigger
//     this._scanbarcodeService.disconnect();

//     // 把硬件 trigger 切回 RFID
//     this._scanRfidService.setTriggerMode('RFID').subscribe({
//       next: () => {
//         // 确保 RFID 已连接并 init listener（按你实际逻辑决定要不要每次都 connect）
//         this._scanRfidService.connectReader().subscribe();
//       },
//       error: (e) => console.error('setTriggerMode RFID failed', e)
//     });

//   } else {
//     this._configRfidService.setBeeperVolume(BeeperVolumeLevels.QUIET, false);

//     // 先停 RFID inventory（你 Java 里应该有 stopScan -> stopInventory）
//     this._scanRfidService.stopScan().subscribe({
//       next: () => {
//         // 把硬件 trigger 交还给 BARCODE
//         this._scanRfidService.setTriggerMode('BARCODE').subscribe({
//           next: () => {
//             // 再恢复 barcode scanner（一定要执行，不要再用 isCameraValid 挡住）
//             this._scanbarcodeService.connectReader().subscribe?.() ?? this._scanbarcodeService.connectReader();
//           },
//           error: (e) => console.error('setTriggerMode BARCODE failed', e)
//         });
//       },
//       error: (e) => console.error('stopScan failed', e)
//     });
//   }
// }

}

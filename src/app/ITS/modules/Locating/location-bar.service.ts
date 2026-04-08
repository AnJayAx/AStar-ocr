import { Injectable } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { BehaviorSubject, filter, from, map, Observable, Subject, switchMap, takeUntil, takeWhile, tap } from 'rxjs';
import RFIDPlugin from '../../shared/interfaces/plugins/RFIDPlugin';

@Injectable()
export class LocationBarService {  
  private locationingID: string;
  private isPressed: boolean = false;

  private distanceSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  public distance$: Observable<number> = this.distanceSubject.asObservable();

  private isScanningSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isScanning$: Observable<boolean> = this.isScanningSubject.asObservable();

  private triggerPressEventListener: PluginListenerHandle;
  private handleDistanceDataListener: PluginListenerHandle;

  constructor(
    private _scanrfidService: ScanRfidService,
    private _tagsService: ScannedTagsService,
    private _itsService: ItsServiceService,
  ) {
    this._scanrfidService.disconnect();
  }

  getItemInfoByBatch(): Observable<any[]> {
    return this._tagsService.scannedTags$.pipe(
      filter(tags => tags?.length > 0),
      map(tags => { return tags.map(tag => { return {"EPC_ID": tag}; } ); }),
      switchMap(epcTags => this._itsService.postItemsByEpcId(epcTags))
    );
  }

  clearBatchItemInfo() {
    this._tagsService.clearScannedTags();
  }

  /* Set locationingID for trigger-based locationing */
  async setLocationingID(locationingID: string) {
    this.locationingID = locationingID;
    await RFIDPlugin.setLocationingID({ tagID: this.locationingID });
  }

  async removeLocationingID() {
    this.locationingID = "";
    await RFIDPlugin.removeLocationingID();
  }

  async connect() {
    const response = await RFIDPlugin.connect({ value: 'Hello World'});
    console.log('[LOC] Response from native:', response);
    this.initReader();
  }

  private async initReader() {
    /* Listen for trigger press event */
    this.triggerPressEventListener = await RFIDPlugin.addListener('triggerPressEvent', (info: any) => {
      console.log('triggerPressEvent', info);
      this.triggerLocationScan(info.isPress);
    });

    /* Obtain distance data */
    this.handleDistanceDataListener = await RFIDPlugin.addListener('handleDistanceData', (info: any) => {
      console.log('handleDistanceData', JSON.stringify(info.result));
      if (info.result) {
        const distance = parseInt(info.result.trim().replace('[','').replace(']',''));
        this.distanceSubject.next(distance);
      }
    });

    console.log('RFID reader init - for locationing');
  }

  private async triggerLocationScan(isPress: boolean) {
    if (isPress) {
      await RFIDPlugin.setLocationingID({ tagID: this.locationingID });
      this.startLocationScan();
      this.isPressed = isPress;
    } else if (this.isPressed && !isPress) {
      this.stopLocationScan();
    }
  }

  async startLocationScan() {
    this.isScanningSubject.next(true);
    await RFIDPlugin.performLocationingScan({ tagID: this.locationingID });
    console.log('start location scan');
  }

  async stopLocationScan() {
    await RFIDPlugin.stopLocationingScan({ value: 'Stop locationing scan' });
    this.isScanningSubject.next(false);
    this.distanceSubject.next(0);
    console.log('stop location scan');
  }

  async disconnect() {
    this.triggerPressEventListener?.remove();
    this.handleDistanceDataListener?.remove();
    this.triggerPressEventListener = this.handleDistanceDataListener = undefined;
    this.isPressed = false;
    this.isScanningSubject.next(false);
    this.distanceSubject.next(0);

    await RFIDPlugin.disconnect();
  }

}


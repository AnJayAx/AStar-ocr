import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BeeperVolumeLevels, DEFAULT_BEEPER_VOLUME } from '../constants/scan.enum';
import { ZebraPowerLevels } from '../constants/scanning.constants';
import { powerSettingKey, beeperVolumeKey } from '../constants/storagekeys.constants';
import RFIDPlugin from '../interfaces/plugins/RFIDPlugin';

@Injectable({
  providedIn: 'root'
})
export class ConfigRfidService {
  private powerLevelSubject: BehaviorSubject<ZebraPowerLevels> = new BehaviorSubject(undefined);
  public powerLevel$: Observable<ZebraPowerLevels> = this.powerLevelSubject.asObservable();

  private beeperVolumeSubject: BehaviorSubject<BeeperVolumeLevels> = new BehaviorSubject(undefined);
  public beeperVolume$: Observable<BeeperVolumeLevels> = this.beeperVolumeSubject.asObservable();

  constructor(
    private _storage: StorageService
  ) {}

  getSavedBeeperVolume(): BeeperVolumeLevels {
    return parseInt(this._storage.getItem(beeperVolumeKey)) as BeeperVolumeLevels;
  }

  async setBeeperVolume(volume: number, enableSave: boolean = true) {
    const deviceBeeperVolume = volume as BeeperVolumeLevels;
    const response = await RFIDPlugin.setBeeperVolume({ volume: deviceBeeperVolume.toString() });
    console.log('[config-rfid service]  setBeeperVolume', response);
    if (enableSave) {
      this._storage.setItem(beeperVolumeKey, deviceBeeperVolume.toString());
    }
    this.beeperVolumeSubject.next(deviceBeeperVolume);
  }

  setDefaultBeeperVolume() {
    let beeperVolume: BeeperVolumeLevels;
    const storedBeeperVolumeStr = this._storage.getItem(beeperVolumeKey);
    console.log('[config-rfid service] setDefaultBeeperVolume > stored value', storedBeeperVolumeStr);

    if (this._storage.itemIsUndefinedOrEmpty(storedBeeperVolumeStr)) {
      beeperVolume = DEFAULT_BEEPER_VOLUME;
    } else {
      beeperVolume = JSON.parse(storedBeeperVolumeStr) as BeeperVolumeLevels;
    }

    this.setBeeperVolume(beeperVolume);
  }

  async setPowerLevel(level: string) {
    if (Object.values(ZebraPowerLevels).includes(level as ZebraPowerLevels)) {
      const devicePowerLevel = level as ZebraPowerLevels;
      const response = await RFIDPlugin.setRFIDPowerLevel({ level: devicePowerLevel });
      console.log('[config-rfid service] setPowerLevel', response);
      this._storage.setItem(powerSettingKey, devicePowerLevel);
      this.powerLevelSubject.next(devicePowerLevel);
    }
  }

  async setDefaultPowerLevel() {
    let devicePowerLevel;
    const storedPowerSettingStr = this._storage.getItem(powerSettingKey);
    console.log('[config-rfid service] setDefaultPowerLevel > stored value', storedPowerSettingStr);
    
    if (this._storage.itemIsUndefinedOrEmpty(storedPowerSettingStr)) {
      const response = await RFIDPlugin.getRFIDPowerLevel({ value: 'Get RFID power level'});
      if (Object.values(ZebraPowerLevels).includes(response.value as ZebraPowerLevels)) {
        devicePowerLevel = response.value as ZebraPowerLevels;
      } else {
        devicePowerLevel = ZebraPowerLevels.POWER_120;
      }
      console.log('[config-rfid service]  Getting device power level...', devicePowerLevel);      
    } else {
      devicePowerLevel = JSON.parse(storedPowerSettingStr) as ZebraPowerLevels;
      console.log('[config-rfid service]  Using stored power level...', devicePowerLevel);
    }

    this.setPowerLevel(devicePowerLevel.toString());
  }

}

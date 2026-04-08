import { Component, OnInit } from '@angular/core';
import { ZebraPowerLevels } from '@its/shared/constants/scanning.constants';
import { BeeperVolumeLevels } from '@its/shared/constants/scan.enum';
import { ConfigRfidService } from '@its/shared/services/config-rfid.service';

@Component({
  selector: 'app-scan-settings',
  templateUrl: './scan-settings.component.html',
  styleUrls: ['./scan-settings.component.scss']
})
export class ScanSettingsComponent implements OnInit {
  powerLevels = [ZebraPowerLevels.MIN_POWER, ZebraPowerLevels.POWER_120, ZebraPowerLevels.POWER_180, ZebraPowerLevels.POWER_270, ZebraPowerLevels.MAX_POWER];
  selectedPowerLevel: ZebraPowerLevels;

  beeperVolumes = [BeeperVolumeLevels.QUIET, BeeperVolumeLevels.LOW, BeeperVolumeLevels.MEDIUM, BeeperVolumeLevels.HIGH];
  selectedBeeperVolume: BeeperVolumeLevels;

  constructor(
    private _configrfidService: ConfigRfidService
  ) {
    this._configrfidService.powerLevel$.subscribe({
      next: (level) => { this.selectedPowerLevel = level; }
    });

    this._configrfidService.beeperVolume$.subscribe({
      next: (volume) =>{ this.selectedBeeperVolume = volume; }
    })
  }

  ngOnInit(): void {}

  onSelectPowerLevel(level: ZebraPowerLevels): void {
    this.selectedPowerLevel = level;
    this._configrfidService.setPowerLevel(level);
  }

  onSelectVolume(volume: BeeperVolumeLevels): void {
    this.selectedBeeperVolume = volume;
    this._configrfidService.setBeeperVolume(volume);
  }

  isPowerLevelBtnHighlighted(level): boolean {
    return this.selectedPowerLevel == level;
  }

  isBeeperVolumeBtnHighlighted(volume): boolean {
    return this.selectedBeeperVolume == volume;
  }

}

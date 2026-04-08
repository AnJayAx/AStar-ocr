import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastService } from '@dis/services/message/toast.service';
import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { ItsSettingsService } from '@its/shared/services/its-settings.service';
import packageInfo from 'package.json';
import { plusIcon } from '@progress/kendo-svg-icons';
import { ChipListRemoveEvent } from "@progress/kendo-angular-buttons";
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-its-settings',
  templateUrl: './its-settings.component.html',
  styleUrls: ['./its-settings.component.scss']
})
export class ItsSettingsComponent implements OnInit, AfterViewInit {
  plusIcon = plusIcon;
  public form: FormGroup;
  appVersion: string = `VERSION ${packageInfo.version}`;
  epcPrefixDataItems: DataItem[];

  validEpcPrefixesToggledText: 'Enabled' | 'Disabled';
  isValidEpcPrefixesEnabled: boolean;
  newPrefix: string = '';

  constructor(
    private _itssettingsService: ItsSettingsService,
    private _toast: ToastService,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
  ) {
    const currentEpcPrefixes = this._itssettingsService.getCurrentEpcPrefixes();
    this.epcPrefixDataItems = currentEpcPrefixes.length > 0 ? currentEpcPrefixes.map(prefix => { return {value: prefix, label: prefix}; }) : [];
    console.log('[its-settings] current prefix items', this.epcPrefixDataItems);

    this.isValidEpcPrefixesEnabled = this._itssettingsService.getCurrentEpcPrefixesEnabled();
    this.validEpcPrefixesToggledText = this.isValidEpcPrefixesEnabled ? 'Enabled' : 'Disabled';

    this._layoutService.changeTitleDisplayAndSetNavBackPath('ITS Settings', null);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  onRemoveChip(e: ChipListRemoveEvent) {
    const removePrefix = e.removedChip.label.replace('***','');
    this.epcPrefixDataItems = this.epcPrefixDataItems.filter(chip => chip.value !== removePrefix);

    const prefixSaveData = this.epcPrefixDataItems.map(chip => chip.value).toString();
    this._itssettingsService.setEpcPrefixes(prefixSaveData);
    this._toast.success(`${e.removedChip.label} removed successfully`);
  }

  onNewPrefixChange(updatedPrefix: string) {
    this.newPrefix = updatedPrefix;
  }

  onAddChip() {
    if (this.newPrefix.length > 0) {
      this.epcPrefixDataItems.push({ label: this.newPrefix.trim(), value: this.newPrefix.trim() });

      const prefixSaveData = this.epcPrefixDataItems.map(chip => chip.value).toString();
      this._itssettingsService.setEpcPrefixes(prefixSaveData);
      this._toast.success("Changes successfully saved");  

      this.newPrefix = '';  
    } else {
      this._toast.warning('Please enter one or more characters.');
    }
  }

  onToggleValidEpcPrefixes() {
    this.isValidEpcPrefixesEnabled = !this.isValidEpcPrefixesEnabled;
    this.validEpcPrefixesToggledText = this.isValidEpcPrefixesEnabled ? 'Enabled' : 'Disabled';

    this._itssettingsService.setEpcPrefixesEnabled(this.isValidEpcPrefixesEnabled);
  }
  }

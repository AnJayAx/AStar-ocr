import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '@dis/services/storage/storage.service';
import { faCancel } from '@fortawesome/free-solid-svg-icons';
import { itemTrackingIPKey, itemTrackingPortKey, sptDocIPKey, sptDocPortKey, keycloakIPKey, keycloakRealmKey, keycloakClientKey, keycloakPortKey, httpsOnlyKey, isDefaultUrlCustomKey, customerIPKey, customerPortKey, defaultUrlKey, keycloakUrlKey} from '@its/shared/constants/storagekeys.constants';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsSettingsService } from '@its/shared/services/its-settings.service';
import { environment } from 'src/environments/environment.mobile-dev';
import { sharedVariables } from 'src/environments/shared.variables';

enum InputMode {
  'IP', 'Custom'
}
@Component({
  selector: 'app-set-url-form',
  templateUrl: './set-url-form.component.html',
  styleUrls: ['./set-url-form.component.scss']
})
export class SetUrlFormComponent implements OnInit {
  cancelIcon = faCancel;
  InputMode = InputMode;

  @Output() formValidated: EventEmitter<boolean> = new EventEmitter(false);

  public form: FormGroup;

  defaultInputMode: InputMode;

  constructor(
    private _storage: StorageService,
    private _itsdialog: ItsDialogService,
    private _itssettingsService: ItsSettingsService,
  ) {
    const defaultHttpsOnly = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(httpsOnlyKey)) ? false : this._storage.getStoredBoolean(this._storage.getItem(httpsOnlyKey));
    const defaultIsCustom = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(isDefaultUrlCustomKey)) ? false : this._storage.getStoredBoolean(this._storage.getItem(isDefaultUrlCustomKey));
    const defaultItemTrackingIP = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(itemTrackingIPKey)) ? null : this._storage.getItem(itemTrackingIPKey);
    const defaultItemTrackingPort = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(itemTrackingPortKey)) ? sharedVariables.itemTrackingPort : this._storage.getItem(itemTrackingPortKey);
    const defaultUrl = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(defaultUrlKey)) ? '' : this._storage.getItem(defaultUrlKey);
    const defaultSptDocIP = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(sptDocIPKey)) ? null : this._storage.getItem(sptDocIPKey);
    const defaultSptDocPort = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(sptDocPortKey)) ? sharedVariables.sptDocPort : this._storage.getItem(sptDocPortKey);
    const defaultCustomerIP = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(customerIPKey)) ? '' : this._storage.getItem(customerIPKey);
    const defaultCustomerPort = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(customerPortKey)) ? '' : this._storage.getItem(customerPortKey);
    const defaultKeycloakIP = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(keycloakIPKey)) ?  null : this._storage.getItem(keycloakIPKey);
    const keycloakUrl = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(keycloakUrlKey)) ? '' : this._storage.getItem(keycloakUrlKey);
    const defaultKeycloakPort = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(keycloakPortKey)) ? sharedVariables.keycloakPort : this._storage.getItem(keycloakPortKey);
    const defaultKeycloakRealm = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(keycloakRealmKey)) ? environment.KEYCLOAK_REALM : this._storage.getItem(keycloakRealmKey);
    const defaultKeycloakClient = this._storage.itemIsUndefinedOrEmpty(this._storage.getItem(keycloakClientKey)) ? environment.KEYCLOAK_CLIENT : this._storage.getItem(keycloakClientKey);

    this.defaultInputMode = defaultIsCustom ? InputMode.Custom : InputMode.IP;

    this.form = new FormGroup({
      httpsOnly: new FormControl(defaultHttpsOnly),
      
      itemTrackingIP: defaultIsCustom ? new FormControl(defaultItemTrackingIP) : new FormControl(defaultItemTrackingIP, [Validators.required]),
      itemTrackingPort: defaultIsCustom ? new FormControl(defaultItemTrackingPort) : new FormControl(defaultItemTrackingPort, [Validators.required]),
      defaultUrl: defaultIsCustom ? new FormControl(defaultUrl, [Validators.required]) : new FormControl(defaultUrl), 

      sptDocIP: defaultIsCustom ? new FormControl(defaultSptDocIP) : new FormControl(defaultSptDocIP, [Validators.required]),
      sptDocPort: defaultIsCustom ? new FormControl(defaultSptDocPort) : new FormControl(defaultSptDocPort, [Validators.required]),

      customerIP: defaultIsCustom ? new FormControl(defaultCustomerIP) : new FormControl(defaultCustomerIP, [Validators.required]),
      customerPort: defaultIsCustom ? new FormControl(defaultCustomerPort) : new FormControl(defaultCustomerPort, [Validators.required]),

      keycloakIP: defaultIsCustom ? new FormControl(defaultKeycloakIP) : new FormControl(defaultKeycloakIP, [Validators.required]),
      keycloakPort: defaultIsCustom ? new FormControl(defaultKeycloakPort) : new FormControl(defaultKeycloakPort, [Validators.required]),
      
      keycloakRealm: new FormControl(defaultKeycloakRealm),
      keycloakClient: new FormControl(defaultKeycloakClient),
      keycloakUrl: defaultIsCustom ? new FormControl(keycloakUrl, [Validators.required]) : new FormControl(keycloakUrl), 
    });
  }

  ngOnInit(): void {
    this.save();
    this.formValidated.emit(this.form.valid);
    
    this.form.valueChanges.subscribe({
      next: () => { 
        this.formValidated.emit(this.form.valid); 
        this.save();
      }
    });
  }

  private save(): void {
    this._itssettingsService.setHttpsOnly(this.form.controls['httpsOnly'].value);
    this._itssettingsService.setDefaultUrl(this.form.controls['defaultUrl'].value);

    this._itssettingsService.setItemTrackingIP(this.form.controls['itemTrackingIP'].value);
    this._itssettingsService.setItemTrackingPort(this.form.controls['itemTrackingPort'].value); 
    this._itssettingsService.setItemTrackingUrl(this.form.controls['defaultUrl'].value+"/item");
    this._itssettingsService.setSptDocIP(this.form.controls['sptDocIP'].value);
    this._itssettingsService.setSptDocPort(this.form.controls['sptDocPort'].value);
    this._itssettingsService.setSptDocUrl(this.form.controls['defaultUrl'].value+"/doc");
    this._itssettingsService.setCustomerIP(this.form.controls['customerIP'].value);
    this._itssettingsService.setCustomerPort(this.form.controls['customerPort'].value);
    this._itssettingsService.setCustomerUrl(this.form.controls['defaultUrl'].value+"/customer");
    this._itssettingsService.setKeycloakIP(this.form.controls['keycloakIP'].value);
    this._itssettingsService.setKeycloakPort(this.form.controls['keycloakPort'].value);
    this._itssettingsService.setKeyCloakUrl(this.form.controls['keycloakUrl'].value);
    this._itssettingsService.setKeycloakRealm(this.form.controls['keycloakRealm'].value);
    this._itssettingsService.setKeycloakClient(this.form.controls['keycloakClient'].value);

    this._itssettingsService.setDefaultCustomUrlEnabled(this.defaultInputMode===InputMode.Custom);
  }

  clearForm(): void {
    this._itsdialog.genericConfirmAction(null, 'Clear all form fields?').subscribe({
      next: (response) => {
        if (response.primary) {
          this.form.reset();
        }
      }
    });
  }

  onDefaultInputModeToggled(isToggled: boolean) {
    this.defaultInputMode = this.defaultInputMode === InputMode.IP ? InputMode.Custom : InputMode.IP;

    if (this.defaultInputMode === InputMode.IP) {
      this.form.get('itemTrackingIP').setValidators([Validators.required]);
      this.form.get('itemTrackingPort').setValidators([Validators.required]);
      this.form.get('defaultUrl').clearValidators();

      this.form.get('sptDocIP').setValidators([Validators.required]);
      this.form.get('sptDocPort').setValidators([Validators.required]);

      this.form.get('customerIP').setValidators([Validators.required]);
      this.form.get('customerPort').setValidators([Validators.required]);

    } else {
      this.form.get('defaultUrl').setValidators([Validators.required]);
      this.form.get('keycloakUrl').setValidators([Validators.required]);
      this.form.get('itemTrackingIP').clearValidators();
      this.form.get('itemTrackingPort').clearValidators();

      this.form.get('sptDocIP').clearValidators();
      this.form.get('sptDocPort').clearValidators();

      this.form.get('customerIP').clearValidators();
      this.form.get('customerPort').clearValidators();

      this.form.get('keycloakIP').clearValidators();
      this.form.get('keycloakPort').clearValidators();
    }

    this.form.get('itemTrackingIP').updateValueAndValidity();
    this.form.get('itemTrackingPort').updateValueAndValidity();
    this.form.get('defaultUrl').updateValueAndValidity();

    this.form.get('sptDocIP').updateValueAndValidity();
    this.form.get('sptDocPort').updateValueAndValidity();

    this.form.get('customerIP').updateValueAndValidity();
    this.form.get('customerPort').updateValueAndValidity();

    this.form.get('keycloakUrl').updateValueAndValidity();
    this.form.get('keycloakIP').updateValueAndValidity();
    this.form.get('keycloakPort').updateValueAndValidity();
    this.save();
  }

}

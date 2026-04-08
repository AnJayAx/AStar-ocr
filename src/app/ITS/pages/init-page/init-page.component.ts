import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthKeycloakService } from '@dis/auth/auth-keycloak.service';
import { User } from '@dis/components/profile-menu/profile-menu.props';
import { StorageService } from '@dis/services/storage/storage.service';
import { InitPageEventType } from '@its/shared/constants/constants';
import { keycloakClientKey, keycloakIPKey, keycloakPortKey, keycloakRealmKey, httpsOnlyKey, keycloakUrlKey } from '@its/shared/constants/storagekeys.constants';
import { KeycloakEvent, KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { Subject, distinctUntilKeyChanged } from 'rxjs';
import { environment } from 'src/environments/environment.mobile-dev';
import { InitPageEventQueueService } from './init-page-event-queue.service';
import { ItsSettingsService } from '@its/shared/services/its-settings.service';
import { ToastService } from '@dis/services/message/toast.service';
import { ConfigRfidService } from '@its/shared/services/config-rfid.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { ScanMode, ScanmodeService } from '@its/shared/services/scanmode.service';

@Component({
  selector: 'app-init-page',
  templateUrl: './init-page.component.html',
  styleUrls: ['./init-page.component.scss']
})
export class InitPageComponent implements OnInit, OnDestroy {
  continueIcon = faRightToBracket;
  private destroyed$: Subject<boolean> = new Subject();
  reloadComponent: any;
  reloadElemRef: ElementRef;

  isMobile: boolean = environment.isMobile;
  isSetupCompleted: boolean = false;
  user: User;

  isKcCustomUrlEnabled: boolean;

  constructor(
    private _itssettingsService: ItsSettingsService,
    private keycloak: KeycloakService,
    private _auth: AuthKeycloakService,
    private _storage: StorageService,
    private router: Router,
    private eventQueue: InitPageEventQueueService,
    private elemRef: ElementRef,
    private route: ActivatedRoute,
    private toast: ToastService,
    private _configRfid: ConfigRfidService,
    private _layoutService: LayoutService,
    private _scanmodeService: ScanmodeService,
  ) {
    this._layoutService.changeTitleDisplay('Inventory App');
    this.reloadComponent = this;
    this.reloadElemRef = this.elemRef;

    this._itssettingsService.defaultCustomUrlEnabled$.subscribe({
      next: (isEnabled) => this.isKcCustomUrlEnabled = isEnabled
    });
  }

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get("type");
    if (type === 'logout') {
      this.logout();
      this.eventQueue.dispatch(InitPageEventType.LOGGED_OUT);
    } else {
      this.loadInitPage();
    }
  }

  private loadInitPage(): void {
    this.eventQueue.on(InitPageEventType.LOGGED_OUT).subscribe({
      next: () => {
        setTimeout(() => this.toast.default('Logout successful.'), 700);
      }
    });

    this.keycloak.keycloakEvents$.pipe(distinctUntilKeyChanged('type')).subscribe({
      next: (event: KeycloakEvent) => {
        if (KeycloakEventType.OnAuthSuccess === event.type) {
          this._auth.isLoggedIn().then(async (isLoggedIn) => {
            if (isLoggedIn) {
              this.user = await this._auth.getUserDetails();
              
              if (!!this.user && !!this.user.id && this.user.username !== null && this.user.username.length > 0) {
                this._itssettingsService.setKeycloakUserId(this.user.id);
                this._itssettingsService.setKeycloakUsername(this.user.username);

                this.eventQueue.dispatch(InitPageEventType.LOGIN_DONE);

                this._scanmodeService.setSelectedScanMode(ScanMode.Barcode);
                this._configRfid.setDefaultBeeperVolume();
                this._configRfid.setDefaultPowerLevel();

                this.router.navigateByUrl('/mainmenunew');

              } else {
                console.error('(init-page) user details undefined');
              }
            }
            else {
              alert("Unable to reach the API service. Please check again.");
            }
          });
        }
        else if (KeycloakEventType.OnAuthLogout === event.type) {
          console.log('OnAuthLogout');
        }
      }
    });

    if (!this.isMobile || (this._itssettingsService.urlsInitialized() && this._itssettingsService.keycloakInitialized())) {
      console.log('urls and keycloak params are defined. continuing...');
      this.continue();
    } else {
      console.log('urls and/or keycloak params are undefined');
    }
  }

  private initializeKeycloak() {
    const httpPrefix = this._storage.getStoredBoolean(this._storage.getItem(httpsOnlyKey)) === true ? 'https' : 'http';
    const kcIP = this._storage.getItem(keycloakIPKey);
    const kcPort = this._storage.getItem(keycloakPortKey);
    const kcUrl = this._storage.getItem(keycloakUrlKey);
    const kcRealm = this._storage.getItem(keycloakRealmKey);
    const kcClient = this._storage.getItem(keycloakClientKey);

    let keycloakURL = environment.KEYCLOAK_URL;
    let keycloakRealm = environment.KEYCLOAK_REALM;
    let keycloakClient = environment.KEYCLOAK_CLIENT;

    const isKcEndpointDefined = this.isKcCustomUrlEnabled ? this._storage.itemIsDefined(kcUrl) : this._storage.itemIsDefined(kcIP) && this._storage.itemIsDefined(kcPort)

    if (isKcEndpointDefined) {
      keycloakURL = this.isKcCustomUrlEnabled ? `${kcUrl}/auth/` : `${httpPrefix}://${kcIP}:${kcPort}/auth/`;
      this._itssettingsService.setKeycloakIP(kcIP);
      this._itssettingsService.setKeycloakPort(kcPort);
      this._itssettingsService.setKeyCloakUrl(kcUrl);
    }

    if (this._storage.itemIsDefined(kcRealm)) {
      keycloakRealm = kcRealm;
    }

    if (this._storage.itemIsDefined(kcClient)) {
      keycloakClient = kcClient;
    }

    this._itssettingsService.setKeycloakRealm(keycloakRealm);
    this._itssettingsService.setKeycloakClient(keycloakClient);

    try {

      this.keycloak.init(
        {
          config: {
            url: keycloakURL,
            realm: keycloakRealm,
            clientId: keycloakClient
          },
          loadUserProfileAtStartUp: true,
          enableBearerInterceptor: true,
          bearerPrefix: 'Bearer',
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false,
            adapter: 'capacitor-native',
            redirectUri: environment.APP_ROOT
          },
        },
      )
        .then(success => { console.log(`keycloak init return ${success}`); })
        .catch(e => console.log(`keycloak init exception: ${e}`));
    } catch (exception) {
      console.error(exception);
    }
  }

  private logout() {
    const logoutURL = this._itssettingsService.getKeycloakLogoutUrl();
    window.location.replace(logoutURL);
  }

  onFormValidation(validated: boolean) {
    this.isSetupCompleted = validated;
  }

  continue() {
    this.initializeKeycloak();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

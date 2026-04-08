import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { User } from '@dis/components/profile-menu/profile-menu.props';
import { Notification } from '@dis/components/notifications-menu/notifications-menu.props';
import {
  handleNotificationsClick,
  getNotifications,
  YOUR_APP_NAME,
  APP_OPTIONS,
} from '@dis/settings/behavior.config';
import { Router } from '@angular/router';
import { AuthKeycloakService } from '@dis/auth/auth-keycloak.service';
import { AuthGuard } from '@dis/auth/auth.guard';

import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { InitPageEventQueueService } from '@its/pages/init-page/init-page-event-queue.service';
import { InitPageEventType } from '@its/shared/constants/constants';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ConfigRfidService } from '@its/shared/services/config-rfid.service';
import {
  ScanMode,
  ScanmodeService,
} from '@its/shared/services/scanmode.service';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  languages: any[];
  languageSelected: any;
  isSelectionEnabled: any;
  isNotificationEnabled: any;
  isDarkMode = false;
  classNameDarkMode: string;
  user: User;
  notifications: Array<Notification>;
  appBarTitle = YOUR_APP_NAME;
  currentFocusedMenu = 'none';
  isMenuCollapsed = true;
  isSideMenuSelected = true;
  isLoggedIn$: Promise<boolean>;
  dataReady: boolean = false;
  isMobile: boolean = false;
  public isOCR: boolean = false;

  isIOS: boolean = false;
  enableSettings: boolean = false;
  isInModule: boolean = false;

  constructor(
    private _auth: AuthKeycloakService,
    private _roleGuardService: AuthGuard,
    private _router: Router,
    private translate: TranslateService,
    private renderer: Renderer2,
    private ref: ChangeDetectorRef,
    private eventQueue: InitPageEventQueueService,
    @Inject(DOCUMENT) private document: Document,

    private _layoutService: LayoutService,
    private _configRfidService: ConfigRfidService,
    private _scanmodeService: ScanmodeService,
    private _scanbarcodeService: ScanBarcodeService,
    private _scanrfidService: ScanRfidService
  ) {
    // retrieve Language list from environment variable
    // Only set language if i18n is enabled.
    this.isSelectionEnabled = APP_OPTIONS.i18n.isSelectionEnabled;
    this.languages = APP_OPTIONS.i18n.supported;
    this.languageSelected = this.languages.find(
      (item) => item && item.value === APP_OPTIONS.i18n.default
    );
    this.translate.setDefaultLang(this.languageSelected.value);
    this.translate.use(this.languageSelected.value);

    this.isNotificationEnabled = APP_OPTIONS.notification.isNotificationEnabled;
    this.isMobile = environment.isMobile ? true : false;
    this.isIOS = Capacitor.getPlatform() === 'ios';
    if (this.isMobile) {
      this.renderer.addClass(this.document.body, 'isMobile');
    }

    if (APP_OPTIONS.sidemenu) {
      this.isSideMenuSelected = APP_OPTIONS.sidemenu.isSelected
        ? APP_OPTIONS.sidemenu.isSelected
        : false;

      // if Mobile Mode is selected, then side menu should be disabled.
      if (this.isMobile) {
        this.isSideMenuSelected = false;
      }

      if (!this.isSideMenuSelected) {
        this.isMenuCollapsed = true;
      } else {
        this.isMenuCollapsed = APP_OPTIONS.sidemenu.collapsedByDefault
          ? APP_OPTIONS.sidemenu.collapsedByDefault
          : false;
      }
    }

    // Check and set darkmode
    this.classNameDarkMode = APP_OPTIONS.darkmode.className;
    if (APP_OPTIONS.darkmode && APP_OPTIONS.darkmode.isDefaultDarkMode) {
      this.renderer.addClass(this.document.body, this.classNameDarkMode);
      this.isDarkMode = true;
    }

    this.eventQueue.on(InitPageEventType.LOGIN_DONE).subscribe({
      next: () => {
        this.enableSettings = true;
      },
    });

    this.eventQueue.on(InitPageEventType.LOGGED_OUT).subscribe({
      next: () => {
        this.enableSettings = false;
      },
    });

    this._layoutService.titleDisplay$.asObservable().subscribe({
      next: (pageName) => {
        this.appBarTitle = pageName;
        this.isInModule = this.appBarTitle != YOUR_APP_NAME;
        this.isOCR = pageName == "OCR";
        
        console.log('[layout] current page', pageName);
      },
    });

    this._layoutService.isInModule$.subscribe({
      next: async (isInModule) => {
        this.isInModule = isInModule;
        console.log('[layout] isInModule ', this.isInModule);

        if (!this.isInModule) {
          await this._scanbarcodeService.disconnect();
          await this._scanrfidService.disconnect();
        }
      },
    });

    setInterval(() => this.ref.detectChanges(), 100);

    this._scanbarcodeService.isScanning$.subscribe({
      next: (e) => {
        console.log('[scan-barcode service] isScanning ', e);
      },
    });
    this._scanrfidService.isScanning$.subscribe({
      next: (e) => console.log('[scan-rfid service] isScanning ', e),
    });
  }

  ngOnInit() {
    this.dataReady = true;
  }

  ngAfterViewInit(): void {}

  getData = async () => {
    this.notifications = await getNotifications();
  };

  onNotificationClick = (notificationId) => {
    handleNotificationsClick(notificationId);
  };

  logout() {
    this._auth.logout();
  }

  isLoginView() {
    return this._router.url === '/login';
  }

  checkIsLoggedIn() {
    console.log('Start checking is log in....');
    this.isLoggedIn$ = this._auth.isLoggedIn();
  }

  isApprovedUser() {
    return this._roleGuardService.isApprovedUser();
  }

  languageChange(result): void {
    this.translate.use(result.value);
  }

  menuToggle(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onThemeChange($event): void {
    if (this.document.body.classList.contains(this.classNameDarkMode)) {
      this.setDarkModeOff();
    } else {
      this.setDarkModeOn();
    }
  }

  private setDarkModeOn(): void {
    this.renderer.addClass(this.document.body, this.classNameDarkMode);
  }

  private setDarkModeOff(): void {
    this.renderer.removeClass(this.document.body, this.classNameDarkMode);
  }

  changeFontSize(value: string): void {
    switch (value) {
      case 'sm-a': {
        console.log('Hello');
        this.renderer.setStyle(this.document.body, 'font-size', '16px');
        break;
      }
      case 'm-a': {
        this.renderer.setStyle(this.document.body, 'font-size', '18px');
        break;
      }
      case 'l-a': {
        this.renderer.setStyle(this.document.body, 'font-size', '20px');
        break;
      }
    }
  }

  onActivate(e) {
    console.log('**onActivate**', e);
  }

  onSettingsChange(option: string) {}
}

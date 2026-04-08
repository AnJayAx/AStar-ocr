// Angular
import { NgModule, APP_INITIALIZER, forwardRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {HttpClient, HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

// Environment
import { environment } from 'src/environments/environment';

// Addon
import { ClickOutsideModule } from 'ng-click-outside';
import { JwtModule } from '@auth0/angular-jwt';
import 'hammerjs';

// Kendo
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { IconsModule } from '@progress/kendo-angular-icons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import {
  GridModule,
  PDFModule,
  ExcelModule
} from '@progress/kendo-angular-grid';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { MenuModule } from '@progress/kendo-angular-menu';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LabelModule } from '@progress/kendo-angular-label';
import { InputsModule } from '@progress/kendo-angular-inputs';

// Components
import { NotificationsMenuComponent } from './DIS/components/notifications-menu/notifications-menu.component';
import { ProfileMenuComponent } from './DIS/components/profile-menu/profile-menu.component';
import { SidebarComponent } from './DIS/components/sidebar/sidebar.component';
import { LayoutComponent } from './DIS/components/layout/layout.component';

// App
import { AppRoutingModule } from './DIS/settings/routes/app-routing.module';
import { AppComponent } from './app.component';
import { ViewHeadingComponent } from './DIS/components/view-heading/view-heading.component';
import { ViewFilterComponent } from './DIS/components/view-filter/view-filter.component';
import { IndicatorCustomSampleComponent } from './DIS/components/indicator-custom-sample/indicator-custom-sample.component';

// Views
import { LoginComponent } from './DIS/views/login/login.component';
import { SamplePageComponent } from './DIS/views/sample-page/sample-page.component';
import { EditedPageComponent } from './DIS/views/edited-page/edited-page.component';
import {GaugesModule} from '@progress/kendo-angular-gauges';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';
import { CustomUiBlockerComponent } from './DIS/components/custom-ui-blocker/custom-ui-blocker.component';
import { NotificationModule } from '@progress/kendo-angular-notification';
import {HttpInterceptorService} from '@dis/services/http/http-interceptor.service';
import { DashboardOneComponent } from './DIS/views/dashboard-one/dashboard-one.component';
import { DashboardTwoComponent } from './DIS/views/dashboard-two/dashboard-two.component';
import { DashboardThreeComponent } from './DIS/views/dashboard-three/dashboard-three.component';
import { InputFieldsComponent } from './DIS/views/input-fields/input-fields.component';
import { TablesComponent } from './DIS/views/tables/tables.component';
import {DialogModule, WindowModule} from '@progress/kendo-angular-dialog';
import {DatePickerModule, DateTimePickerModule} from '@progress/kendo-angular-dateinputs';
import { FormFillingComponent } from './DIS/views/form-filling/form-filling.component';
import {UploadModule} from '@progress/kendo-angular-upload';

//Keycloak configuration
import { KeycloakAngularModule } from 'keycloak-angular';
import { initializeKeycloak } from './DIS/init/keycloak-init.factory';
import { KeycloakService } from 'keycloak-angular';
import {MockedKeycloakService} from '@dis/services/mocks/mock-authentication';
import { HorizontalMenuComponent } from './DIS/components/horizontal-menu/horizontal-menu.component';
import { MobileNavigationMenuComponent } from './DIS/components/mobile-navigation-menu/mobile-navigation-menu.component';
import { MobileNavigationListComponent } from '@dis/components/mobile-navigation-list/mobile-navigation-list.component';
import { MobileUserProfileComponent } from './DIS/components/mobile-user-profile/mobile-user-profile.component';
import { SearchIconComponent } from './DIS/components/search-icon/search-icon.component';
import { SettingComponent } from './DIS/components/setting/setting.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// added
// services
import { ItsServiceService } from '@its/shared/services/its-service.service';
// components
import { RegistrationModuleComponent } from '@its/modules/Registration/registration-module/registration-module.component';
import { LoginPageComponent } from '@its/pages/login-page/login-page.component';
import { DownloadDataPageComponent } from '@its/pages/download-data-page/download-data-page.component';
import { MainMenuNewComponent } from '@its/mainmenu/views/default/main-menu-new/main-menu-new.component';
import { FloatingScanButtonComponent } from '@its/shared/components/floating-scan-button/floating-scan-button.component';
import { SampleRfidComponent } from './sample-rfid/sample-rfid.component';
import { CheckinoutModuleComponent } from '@its/modules/Checkinout/part1_scan/checkinout-module/checkinout-module.component';
import { CheckinoutModuleFormComponent } from '@its/modules/Checkinout/part2_form/checkinout-module-form/checkinout-module-form.component';
import { MainMenuNewListComponent } from '@its/mainmenu/views/list/main-menu-new-list/main-menu-new-list.component';
import { LogoutPageComponent } from '@its/pages/logout-page/logout-page.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { SignaturePadModule } from 'angular2-signaturepad';
import { SignatureFieldComponent } from '@its/shared/components/signature-field/signature-field.component';
import { RelocationModuleComponent } from '@its/modules/Relocation/part1_scan/relocation-module/relocation-module.component';
import { LoanReturnModuleComponent } from '@its/modules/LoanReturn/part1_scan/loan-return-module/loan-return-module.component';
import { RegistrationSingleTagviewComponent } from '@its/modules/Registration/components/registration-single-tagview/registration-single-tagview.component';
import { RelocationModuleFormComponent } from '@its/modules/Relocation/part2_form/relocation-module-form/relocation-module-form.component';
import { LoanReturnModuleFormComponent } from '@its/modules/LoanReturn/part2_form/loan-return-module-form/loan-return-module-form.component';
import { GeneralIndicatorComponent } from '@its/shared/components/general-indicator/general-indicator.component';
import { GeneralFormIndicatorComponent } from '@its/shared/components/general-form-indicator/general-form-indicator.component';
import { AuditModuleComponent } from '@its/modules/Audit/audit-module/audit-module.component';
import { StDetailsComponent } from '@its/modules/Stocktaking/st-details/st-details.component';
import { StScanComponent } from '@its/modules/Stocktaking/st-scan/st-scan.component';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { MultiselectPopupDisplayComponent } from '@its/shared/components/MultiselectPopup/multiselect-popup-display/multiselect-popup-display.component';
import { MultiselectPopupSelectionComponent } from '@its/shared/components/MultiselectPopup/multiselect-popup-selection/multiselect-popup-selection.component';
import { SubmissionDialogComponent } from '@its/shared/components/submission-dialog/submission-dialog.component';
import { StScanOverviewComponent } from '@its/modules/Stocktaking/st-scan-overview/st-scan-overview.component';
import { StItemCardComponent } from '@its/modules/Stocktaking/components/st-item-card/st-item-card.component';
import { AutocompletesearchInputComponent } from '@its/shared/components/autocompletesearch-input/autocompletesearch-input.component';
import { StListviewComponent } from '@its/modules/Stocktaking/components/st-listview/st-listview.component';
import { StScanFoundComponent } from '@its/modules/Stocktaking/st-scan-found/st-scan-found.component';
import { StScanMisplacedComponent } from '@its/modules/Stocktaking/st-scan-misplaced/st-scan-misplaced.component';
import { StScanNotregisteredComponent } from '@its/modules/Stocktaking/st-scan-notregistered/st-scan-notregistered.component';
import { StScanExcessComponent } from '@its/modules/Stocktaking/st-scan-excess/st-scan-excess.component';
import { StScanNoaccessComponent } from '@its/modules/Stocktaking/st-scan-noaccess/st-scan-noaccess.component';
import { ScanPageBarcodeComponent } from '@its/shared/components/Scanning/scan-page-barcode/scan-page-barcode.component';
import { ScanmodeButtongroupComponent } from '@its/shared/components/Scanning/scanmode-buttongroup/scanmode-buttongroup.component';
import { StartscanBtnComponent } from '@its/shared/components/Scanning/startscan-btn/startscan-btn.component';
import { ClearscanBtnComponent } from './ITS/shared/components/Scanning/clearscan-btn/clearscan-btn.component';
import { ScanrfidBtnComponent } from './ITS/shared/components/Scanning/startscan-btn/scanrfid-btn/scanrfid-btn.component';
import { ScanbarcodeBtnComponent } from './ITS/shared/components/Scanning/startscan-btn/scanbarcode-btn/scanbarcode-btn.component';
import { ScanViewListComponent } from '@its/shared/components/Scanning/scan-view-list/scan-view-list.component';
import { ItemCardComponent } from './ITS/shared/components/item-card/item-card.component';
import { ScanViewComponent } from '@its/shared/components/Scanning/scan-view/scan-view.component';
import { ScanViewPrComponent } from '@its/shared/components/Scanning/scan-view-pr/scan-view-pr/scan-view-pr.component';
import { NavbackBtnComponent } from './ITS/shared/components/navback-btn/navback-btn.component';
import { StScanMenurouterComponent } from './ITS/modules/Stocktaking/st-scan-menurouter/st-scan-menurouter.component';
import { PlListComponent } from './ITS/modules/PickingList/pl-list/pl-list.component';
import { PlListitemCardComponent } from './ITS/modules/PickingList/components/pl-listitem-card/pl-listitem-card.component';
import { PlTaglistComponent } from './ITS/modules/PickingList/pl-taglist/pl-taglist.component';
import { PlTagitemCardComponent } from './ITS/modules/PickingList/components/pl-tagitem-card/pl-tagitem-card.component';
import { Scrap1ScanComponent } from '@its/modules/Scrap/scrap1-scan/scrap1-scan.component';
import { Scrap2FormComponent } from '@its/modules/Scrap/scrap2-form/scrap2-form.component';
import { MRO1ScanComponent } from '@its/modules/MRO/mro1-scan/mro1-scan.component';
import { MRO2FormComponent } from '@its/modules/MRO/mro2-form/mro2-form.component';
import { SampleBarcodeComponent } from './sample-barcode/sample-barcode.component';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { LocationBarComponent } from '@its/modules/Locating/components/location-bar/location-bar.component';
import { ScanSettingsComponent } from '@its/shared/components/Scanning/scan-settings/scan-settings.component';
import { LocSearchComponent } from './ITS/modules/Locating/loc-search/loc-search.component';
import { LocScanComponent } from './ITS/modules/Locating/loc-scan/loc-scan.component';
import { AutocompletesearchObjectInputComponent } from './ITS/shared/components/autocompletesearch-object-input/autocompletesearch-object-input.component';
import { HomeBtnComponent } from './ITS/shared/components/home-btn/home-btn.component';
import { ScanSettingsBtnComponent } from './ITS/shared/components/Scanning/scan-settings-btn/scan-settings-btn.component';
import { CheckStatus1ScanComponent } from './ITS/modules/CheckStatus/check-status1-scan/check-status1-scan.component';
import { RegCustomDialogComponent } from './ITS/modules/Registration/components/reg-custom-dialog/reg-custom-dialog.component';
import { ItemInfoComponent } from './ITS/shared/components/item-info/item-info.component';
import { ItemStatusIndicatorComponent } from './ITS/shared/components/item-status-indicator/item-status-indicator.component';
import { ReloadBtnComponent } from './ITS/shared/components/reload-btn/reload-btn.component';
import { RvListComponent } from './ITS/modules/ReceiveVerify/rv-list/rv-list.component';
import { RvListCardComponent } from './ITS/modules/ReceiveVerify/components/rv-list-card/rv-list-card.component';
import { BlockinguiInterceptorService } from '@its/shared/services/blockingui-interceptor.service';
import { QrScanPageComponent } from './ITS/modules/Relocation/qr-scan-page/qr-scan-page.component';
import { IsScanComponent } from './ITS/modules/ItemSplit/is-scan/is-scan.component';
import { IsSplitComponent } from './ITS/modules/ItemSplit/is-split/is-split.component';
import { ItemDisplayCardComponent } from './ITS/modules/ItemSplit/components/item-display-card/item-display-card.component';
import { CustomSwitchComponent } from './ITS/shared/components/custom-switch/custom-switch.component';
import { SmIndicatorComponent } from './ITS/shared/components/sm-indicator/sm-indicator.component';
import { DeletableTagsViewComponent } from './ITS/shared/components/deletable-tags-view/deletable-tags-view.component';
import { ItsSettingsComponent } from './ITS/pages/its-settings/its-settings.component';
import { InitPageComponent } from './ITS/pages/init-page/init-page.component';
import { SetUrlFormComponent } from './ITS/shared/components/set-url-form/set-url-form.component';
import { Update1ScanComponent } from './ITS/modules/Update/update1-scan/update1-scan.component';
import { Update2FormComponent } from './ITS/modules/Update/update2-form/update2-form.component';
import { CustomIndicatorComponent } from './ITS/shared/components/custom-indicator/custom-indicator.component';
import { ItemImageComponent } from './ITS/shared/components/item-image/item-image.component';
import { CheckStatus2InfoRouterComponent } from './ITS/modules/CheckStatus/check-status2-info-router/check-status2-info-router.component';
import { CsItemInfoComponent } from './ITS/modules/CheckStatus/cs-item-info/cs-item-info.component';
import { CsMroHistoryComponent } from './ITS/modules/CheckStatus/cs-mro-history/cs-mro-history.component';
import { CsFlowHistoryComponent } from './ITS/modules/CheckStatus/cs-flow-history/cs-flow-history.component';
import { IsRepackDialogComponent } from './ITS/modules/ItemSplit/components/is-repack-dialog/is-repack-dialog.component';
import { UpdateTagIdComponent } from './ITS/modules/UpdateTagId/update-tag-id/update-tag-id.component';
import { GrVerifyComponent } from './ITS/modules/GRVerify/gr-verify/gr-verify.component';
import { RbScanComponent } from '@its/modules/Refurbishment/rb-scan/rb-scan.component';
import { RbFormComponent } from '@its/modules/Refurbishment/rb-form/rb-form.component';
import { PtOperationSelectComponent } from './ITS/modules/ProductionTraveler/pt-operation-select/pt-operation-select.component';
import { PtOperationDetailsComponent } from './ITS/modules/ProductionTraveler/pt-operation-details/pt-operation-details.component';
import { PtItemCardComponent } from '@its/modules/ProductionTraveler/components/pt-item-card/pt-item-card.component';
import { PtItemScanComponent } from './ITS/modules/ProductionTraveler/pt-item-scan/pt-item-scan.component';
import { PtBomScanComponent } from './ITS/modules/ProductionTraveler/components/pt-bom-scan/pt-bom-scan.component';
import { PtQcDialogComponent } from './ITS/modules/ProductionTraveler/components/pt-qc-dialog/pt-qc-dialog.component';
import { LocationSearchDropdownComponent } from '@its/shared/components/location-search-dropdown/location-search-dropdown.component';
import { MroPartsListComponent } from './ITS/modules/MRO/components/mro-parts-list/mro-parts-list.component';
import { MroPartFormComponent } from './ITS/modules/MRO/components/mro-part-form/mro-part-form.component';
import { WriteOffComponent } from './ITS/modules/WriteOff/write-off/write-off.component';
import { SmMergeFromComponent } from './ITS/modules/StockMerge/sm-merge-from/sm-merge-from.component';
import { SmMergeToComponent } from './ITS/modules/StockMerge/sm-merge-to/sm-merge-to.component';
import { SmConfirmMergeComponent } from './ITS/modules/StockMerge/sm-confirm-merge/sm-confirm-merge.component';
import { SmUpdatedItemCardComponent } from './ITS/modules/StockMerge/components/sm-updated-item-card/sm-updated-item-card.component';
import { TrScanComponent } from './ITS/modules/TagReuse/tr-scan/tr-scan.component';
import { TrFormComponent } from './ITS/modules/TagReuse/tr-form/tr-form.component';
import { CategorySearchDropdownComponent } from './ITS/shared/components/category-search-dropdown/category-search-dropdown.component';
import { ProductreceiveScanComponent } from './ITS/modules/ProductReceive/part1_scan/productreceive-scan/productreceive-scan.component';
import { ProductreceiveFormComponent } from './ITS/modules/ProductReceive/part2_form/productreceive-form/productreceive-form.component';
import { ItemCardPrComponent } from './ITS/shared/components/item-card-pr/item-card-pr.component';
import { ScanViewListprComponent } from './ITS/shared/components/scan-view-listpr/scan-view-listpr.component';
import { ScanViewPr2Component } from './ITS/shared/components/Scanning/scan-view-pr2/scan-view-pr2.component';
import { OCRComponent } from './ITS/modules/OCR/part1_scan/ocr/ocr.component';
// import { Dispatch1ScanComponent } from './ITS/modules/Dispatch/dispatch1-scan/dispatch1-scan.component';
// import { DispatchModuleComponent } from './ITS/modules/Dispatch/part1_scan/dispatch-module/dispatch-module.component';
// import { DispatchScanComponent } from './ITS/modules/Dispatch/part1_scan/dispatch-scan/dispatch-scan.component';
// import { DispatchFormComponent } from './ITS/modules/Dispatch/part2_form/dispatch-form/dispatch-form.component';
// Sort
// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    LayoutComponent,
    NotificationsMenuComponent,
    ProfileMenuComponent,
    LoginComponent,
    SamplePageComponent,
    ViewHeadingComponent,
    ViewFilterComponent,
    IndicatorCustomSampleComponent,
    EditedPageComponent,
    CustomUiBlockerComponent,
    DashboardOneComponent,
    DashboardTwoComponent,
    DashboardThreeComponent,
    InputFieldsComponent,
    TablesComponent,
    FormFillingComponent,
    HorizontalMenuComponent,
    MobileNavigationMenuComponent,
    MobileNavigationListComponent,
    MobileUserProfileComponent,
    SearchIconComponent,
    SettingComponent,
    RegistrationModuleComponent,
    LoginPageComponent,
    DownloadDataPageComponent,
    MainMenuNewComponent,
    FloatingScanButtonComponent,
    SampleRfidComponent,
    CheckinoutModuleComponent,
    MainMenuNewListComponent,
    LogoutPageComponent,
    SignatureFieldComponent,
    RelocationModuleComponent,
    LoanReturnModuleComponent,
    CheckinoutModuleFormComponent,
    RegistrationSingleTagviewComponent,
    RelocationModuleFormComponent,
    LoanReturnModuleFormComponent,
    GeneralIndicatorComponent,
    GeneralFormIndicatorComponent,
    AuditModuleComponent,
    StDetailsComponent,
    StScanComponent,
    MultiselectPopupDisplayComponent,
    MultiselectPopupSelectionComponent,
    SubmissionDialogComponent,
    StScanOverviewComponent,
    StItemCardComponent,
    AutocompletesearchInputComponent,
    StListviewComponent,
    StScanFoundComponent,
    StScanMisplacedComponent,
    StScanNotregisteredComponent,
    StScanExcessComponent,
    StScanNoaccessComponent,
    ScanPageBarcodeComponent,
    Scrap1ScanComponent,
    Scrap2FormComponent,
    ScanmodeButtongroupComponent,
    StartscanBtnComponent,
    ClearscanBtnComponent,
    ScanrfidBtnComponent,
    ScanbarcodeBtnComponent,
    ScanViewComponent,
    ScanViewPrComponent,
    ScanViewListComponent,
    ItemCardComponent,
    NavbackBtnComponent,
    StScanMenurouterComponent,
    PlListComponent,
    PlListitemCardComponent,
    PlTaglistComponent,
    PlTagitemCardComponent,
    MRO1ScanComponent,
    MRO2FormComponent,
    SampleBarcodeComponent,
    LocationBarComponent,
    ScanSettingsComponent,
    LocSearchComponent,
    LocScanComponent,
    AutocompletesearchObjectInputComponent,
    HomeBtnComponent,
    ScanSettingsBtnComponent,
    CheckStatus1ScanComponent,
    RegCustomDialogComponent,
    ItemInfoComponent,
    ItemStatusIndicatorComponent,
    ReloadBtnComponent,
    RvListComponent,
    RvListCardComponent,
    QrScanPageComponent,
    IsScanComponent,
    IsSplitComponent,
    ItemDisplayCardComponent,
    CustomSwitchComponent,
    SmIndicatorComponent,
    DeletableTagsViewComponent,
    ItsSettingsComponent,
    InitPageComponent,
    SetUrlFormComponent,
    Update1ScanComponent,
    Update2FormComponent,
    Update1ScanComponent,
    Update2FormComponent,
    ItsSettingsComponent,
    InitPageComponent,
    SetUrlFormComponent,
    CustomIndicatorComponent,
    ItemImageComponent,
    CheckStatus2InfoRouterComponent,
    CsItemInfoComponent,
    CsMroHistoryComponent,
    CsFlowHistoryComponent,
    IsRepackDialogComponent,
    UpdateTagIdComponent,
    GrVerifyComponent,
    RbScanComponent,
    RbFormComponent,
    PtOperationSelectComponent,
    PtOperationDetailsComponent,
    PtItemCardComponent,
    PtItemScanComponent,
    PtBomScanComponent,
    PtQcDialogComponent,
    LocationSearchDropdownComponent,
    MroPartsListComponent,
    MroPartFormComponent,
    WriteOffComponent,
    SmMergeFromComponent,
    SmMergeToComponent,
    SmConfirmMergeComponent,
    SmUpdatedItemCardComponent,
    TrScanComponent,
    TrFormComponent,
    CategorySearchDropdownComponent,
    ProductreceiveScanComponent,
    ProductreceiveFormComponent,
    ItemCardPrComponent,
    ScanViewListprComponent,
    ScanViewPr2Component,
    OCRComponent,
    // Dispatch1ScanComponent,
    // DispatchModuleComponent,
    // DispatchScanComponent,
    // DispatchFormComponent,
  ],
  imports: [
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('access_token'),
        allowedDomains: [environment.API_ROOT],
        disallowedRoutes: [environment.SSO_ENDPOINT]
      }
    }),
    BrowserModule,
    CommonModule,
    FontAwesomeModule,
    HttpClientModule,
    PopupModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ButtonsModule,
    BrowserAnimationsModule,
    ClickOutsideModule,
    NavigationModule,
    IconsModule,
    LayoutModule,
    DropDownsModule,
    NotificationModule,
    GridModule,
    PDFModule,
    ExcelModule,
    ChartsModule,
    MenuModule,
    IndicatorsModule,
    LabelModule,
    InputsModule,
    GaugesModule,
    WindowModule,
    DialogModule,
    UploadModule,
    KeycloakAngularModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BlockUIModule.forRoot({
      delayStart: 500,
      template: CustomUiBlockerComponent
    }), // Import BlockUIModule
    BlockUIHttpModule.forRoot({
      // blockAllRequestsInProgress: false
    }),
    DateTimePickerModule,
    DatePickerModule,
    // Import Block UI Http Module
    AngularSignaturePadModule,
    ListViewModule,
    ProgressBarModule,
  ],
  providers: [
    {
      // provide: [ItsServiceService, HTTP_INTERCEPTORS],
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlockinguiInterceptorService,
      multi: true
    },

    // Mock KeyCloakService to override actual KeyCloakService during development
    // if commented out it will redirect to keycloak login page
    // MockedKeycloakService,
    {
      provide: KeycloakService,
      useClass: environment.production ? KeycloakService : MockedKeycloakService
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeKeycloak,
    //   multi: true,
    //   deps: [KeycloakService],
    // }, // Initialize the Keycloak Connection
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignatureFieldComponent),
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

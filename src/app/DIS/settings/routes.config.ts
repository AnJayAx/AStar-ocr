import { Routes } from '@angular/router';
import { AppTemplateRoutes } from '@dis/settings/routes/routes.template.config';
import { MobileNavigationListComponent } from '@dis/components/mobile-navigation-list/mobile-navigation-list.component';
import { AuthGuard } from '@dis/auth/auth.guard';
import { NotificationsMenuComponent } from '@dis/components/notifications-menu/notifications-menu.component';
import { MobileUserProfileComponent } from '@dis/components/mobile-user-profile/mobile-user-profile.component';

// Import your app views below and add the array below
// For reference, see routes.template.config.js

import { InitPageComponent } from '@its/pages/init-page/init-page.component';
import { ItsSettingsComponent } from '@its/pages/its-settings/its-settings.component';
import { MainMenuNewComponent } from '@its/mainmenu/views/default/main-menu-new/main-menu-new.component';
import { MainMenuNewListComponent } from '@its/mainmenu/views/list/main-menu-new-list/main-menu-new-list.component';

/* SHARED */
import { MultiselectPopupSelectionComponent } from '@its/shared/components/MultiselectPopup/multiselect-popup-selection/multiselect-popup-selection.component';
import { SubmissionDialogComponent } from '@its/shared/components/submission-dialog/submission-dialog.component';
import { ScanPageBarcodeComponent } from '@its/shared/components/Scanning/scan-page-barcode/scan-page-barcode.component';
import { QrScanPageComponent } from '@its/modules/Relocation/qr-scan-page/qr-scan-page.component';

/* STOCKTAKING */
import { StDetailsComponent } from '@its/modules/Stocktaking/st-details/st-details.component';
import { StScanComponent } from '@its/modules/Stocktaking/st-scan/st-scan.component';
import { StScanOverviewComponent } from '@its/modules/Stocktaking/st-scan-overview/st-scan-overview.component';
import { StScanFoundComponent } from '@its/modules/Stocktaking/st-scan-found/st-scan-found.component';
import { StScanMisplacedComponent } from '@its/modules/Stocktaking/st-scan-misplaced/st-scan-misplaced.component';
import { StScanExcessComponent } from '@its/modules/Stocktaking/st-scan-excess/st-scan-excess.component';
import { StScanNoaccessComponent } from '@its/modules/Stocktaking/st-scan-noaccess/st-scan-noaccess.component';
import { StScanNotregisteredComponent } from '@its/modules/Stocktaking/st-scan-notregistered/st-scan-notregistered.component';
import { StScanMenurouterComponent } from '@its/modules/Stocktaking/st-scan-menurouter/st-scan-menurouter.component';

/* PICKING LIST */
import { PlListComponent } from '@its/modules/PickingList/pl-list/pl-list.component';
import { PlTaglistComponent } from '@its/modules/PickingList/pl-taglist/pl-taglist.component';

/* LOCATING */
import { LocSearchComponent } from '@its/modules/Locating/loc-search/loc-search.component';
import { LocScanComponent } from '@its/modules/Locating/loc-scan/loc-scan.component';

/* MRO */
import { MRO2FormComponent } from '@its/modules/MRO/mro2-form/mro2-form.component';
import { MRO1ScanComponent } from '@its/modules/MRO/mro1-scan/mro1-scan.component';

/* SCRAP */
import { Scrap2FormComponent } from '@its/modules/Scrap/scrap2-form/scrap2-form.component';
import { Scrap1ScanComponent } from '@its/modules/Scrap/scrap1-scan/scrap1-scan.component';

/* CHECK STATUS */
import { CheckStatus1ScanComponent } from '@its/modules/CheckStatus/check-status1-scan/check-status1-scan.component';
import { CheckStatus2InfoRouterComponent } from '@its/modules/CheckStatus/check-status2-info-router/check-status2-info-router.component';
import { CsItemInfoComponent } from '@its/modules/CheckStatus/cs-item-info/cs-item-info.component';
import { CsMroHistoryComponent } from '@its/modules/CheckStatus/cs-mro-history/cs-mro-history.component';
import { CsFlowHistoryComponent } from '@its/modules/CheckStatus/cs-flow-history/cs-flow-history.component';

/* UPDATE */
import { Update1ScanComponent } from '@its/modules/Update/update1-scan/update1-scan.component';
import { Update2FormComponent } from '@its/modules/Update/update2-form/update2-form.component';

/* UPDATE TAG ID */
import { UpdateTagIdComponent } from '@its/modules/UpdateTagId/update-tag-id/update-tag-id.component';

/* LOAN RETURN */
import { LoanReturnModuleComponent } from '@its/modules/LoanReturn/part1_scan/loan-return-module/loan-return-module.component';
import { LoanReturnModuleFormComponent } from '@its/modules/LoanReturn/part2_form/loan-return-module-form/loan-return-module-form.component';

/* RELOCATION */
import { RelocationModuleFormComponent } from '@its/modules/Relocation/part2_form/relocation-module-form/relocation-module-form.component';
import { RelocationModuleComponent } from '@its/modules/Relocation/part1_scan/relocation-module/relocation-module.component';

/* CHECK IN CHECK OUT */
import { CheckinoutModuleFormComponent } from '@its/modules/Checkinout/part2_form/checkinout-module-form/checkinout-module-form.component';
import { CheckinoutModuleComponent } from '@its/modules/Checkinout/part1_scan/checkinout-module/checkinout-module.component';

/* REGISTRATION */
import { RegistrationModuleComponent } from '@its/modules/Registration/registration-module/registration-module.component';

/* RECEIVE/VERIFICATION */
import { RvListComponent } from '@its/modules/ReceiveVerify/rv-list/rv-list.component';

/* AUDIT */
import { AuditModuleComponent } from '@its/modules/Audit/audit-module/audit-module.component';

/* ITEM SPLIT */
import { IsScanComponent } from '@its/modules/ItemSplit/is-scan/is-scan.component';
import { IsSplitComponent } from '@its/modules/ItemSplit/is-split/is-split.component';

/* GR VERIFY */
import { GrVerifyComponent } from '@its/modules/GRVerify/gr-verify/gr-verify.component';

/* PRODUCTION TRAVELER */
import { PtOperationSelectComponent } from '@its/modules/ProductionTraveler/pt-operation-select/pt-operation-select.component';
import { PtOperationDetailsComponent } from '@its/modules/ProductionTraveler/pt-operation-details/pt-operation-details.component';
import { PtItemScanComponent } from '@its/modules/ProductionTraveler/pt-item-scan/pt-item-scan.component';

/* REFURBISHMENT */
import { RbScanComponent } from '@its/modules/Refurbishment/rb-scan/rb-scan.component';
import { RbFormComponent } from '@its/modules/Refurbishment/rb-form/rb-form.component';

/* WRITE-OFF */
import { WriteOffComponent } from '@its/modules/WriteOff/write-off/write-off.component';

/* TAG REUSE */
import { TrScanComponent } from '@its/modules/TagReuse/tr-scan/tr-scan.component';
import { TrFormComponent } from '@its/modules/TagReuse/tr-form/tr-form.component';

/* DEVELOPMENT USE */
import { SampleBarcodeComponent } from 'src/app/sample-barcode/sample-barcode.component';
import { SampleRfidComponent } from 'src/app/sample-rfid/sample-rfid.component';
import { DownloadDataPageComponent } from '@its/pages/download-data-page/download-data-page.component';
import { SmMergeFromComponent } from '@its/modules/StockMerge/sm-merge-from/sm-merge-from.component';
import { SmMergeToComponent } from '@its/modules/StockMerge/sm-merge-to/sm-merge-to.component';
import { SmConfirmMergeComponent } from '@its/modules/StockMerge/sm-confirm-merge/sm-confirm-merge.component';

/* PRODUCT RECEIVE */
import { ProductreceiveScanComponent } from '@its/modules/ProductReceive/part1_scan/productreceive-scan/productreceive-scan.component';
import { ProductreceiveFormComponent } from '@its/modules/ProductReceive/part2_form/productreceive-form/productreceive-form.component';

/* OCR */
import { OCRComponent } from '@its/modules/OCR/part1_scan/ocr/ocr.component';

const routes: Routes = [
  // Define a default redirect
  //{ path: '', pathMatch: 'full', redirectTo: '/sample-rfid' },
  // { path: '', pathMatch: 'full', redirectTo: '/login' },
  // { path: '', pathMatch: 'full', redirectTo: '/mainmenunew' },
  { path: '', pathMatch: 'full', redirectTo: 'init-page' },
  {
    path: 'init-page',
    component: InitPageComponent,
    canActivate: [] /* No AuthGuard for init page */,
    data: {
      elevation: [],
    },
  },

  {
    path: 'its-settings',
    component: ItsSettingsComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'mainmenunew',
    component: MainMenuNewComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'audit',
    component: AuditModuleComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'mainmenunew-list',
    component: MainMenuNewListComponent,
    // canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'registration',
    component: RegistrationModuleComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'checkinout',
    component: CheckinoutModuleComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'checkinoutform',
    component: CheckinoutModuleFormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'productreceive',
    component: ProductreceiveScanComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'productreceiveform',
    component: ProductreceiveFormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'relocation',
    component: RelocationModuleComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'relocationform',
    component: RelocationModuleFormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'loanreturn',
    component: LoanReturnModuleComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'loanreturnform',
    component: LoanReturnModuleFormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'scrap',
    component: Scrap1ScanComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'scrapform',
    component: Scrap2FormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'checkstatus',
    component: CheckStatus1ScanComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'checkstatus-inforouter',
    component: CheckStatus2InfoRouterComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cs-item-info' },
      {
        path: 'cs-item-info',
        component: CsItemInfoComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'cs-mro-history',
        component: CsMroHistoryComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'cs-flow-history',
        component: CsFlowHistoryComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
    ],
  },
  {
    path: 'update',
    component: Update1ScanComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'updateform',
    component: Update2FormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'mro',
    component: MRO1ScanComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'mroform',
    component: MRO2FormComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  {
    path: 'downloaddata',
    component: DownloadDataPageComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },

  {
    path: 'sample-barcode',
    component: SampleBarcodeComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'sample-rfid',
    component: SampleRfidComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'mobile-navigation-list',
    component: MobileNavigationListComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'mobile-user-profile',
    component: MobileUserProfileComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'notifications-menu',
    component: NotificationsMenuComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'st-details',
    component: StDetailsComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'multiselect-popup-selection',
    component: MultiselectPopupSelectionComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'submission-dialog',
    component: SubmissionDialogComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'scan-page-barcode',
    component: ScanPageBarcodeComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'st-scan-menurouter',
    component: StScanMenurouterComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'st-scan-overview' },
      {
        path: 'st-scan-overview',
        component: StScanOverviewComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'st-scan-found',
        component: StScanFoundComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'st-scan-misplaced',
        component: StScanMisplacedComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'st-scan-excess',
        component: StScanExcessComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'st-scan-noaccess',
        component: StScanNoaccessComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
      {
        path: 'st-scan-notregistered',
        component: StScanNotregisteredComponent,
        canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
        data: {
          elevation: [], // List out all roles that are acceptable
        },
      },
    ],
  },
  {
    path: 'st-scan',
    component: StScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  // {
  //   path: 'scan-view',
  //   component: ScanViewComponent,
  //   canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
  //   data: {
  //     elevation: [] // List out all roles that are acceptable
  //   }
  // },
  {
    path: 'pl-list',
    component: PlListComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'pl-taglist',
    component: PlTaglistComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'loc-search',
    component: LocSearchComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'loc-scan',
    component: LocScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'rv-list',
    component: RvListComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  // {
  //   path: 'rv-taglist-menurouter',
  //   component: RvTaglistMenurouterComponent,
  //   canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
  //   data: {
  //     elevation: [] // List out all roles that are acceptable
  //   },
  //   children: [
  //     { path: '', pathMatch: 'full', redirectTo: 'rv-taglist-pending' },
  //     {
  //       path: 'rv-taglist-pending',
  //       component: RvTaglistPendingComponent,
  //       canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
  //       data: {
  //         elevation: [] // List out all roles that are acceptable
  //       }
  //     },
  //     {
  //       path: 'rv-taglist-found',
  //       component: RvTaglistFoundComponent,
  //       canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
  //       data: {
  //         elevation: [] // List out all roles that are acceptable
  //       }
  //     },
  //     {
  //       path: 'rv-taglist-excess',
  //       component: RvTaglistExcessComponent,
  //       canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
  //       data: {
  //         elevation: [] // List out all roles that are acceptable
  //       }
  //     },
  //   ]
  // },
  {
    path: 'qr-scan-page',
    component: QrScanPageComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'is-scan',
    component: IsScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'is-split',
    component: IsSplitComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'update-tag-id',
    component: UpdateTagIdComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'gr-verify',
    component: GrVerifyComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'pt-op-select',
    component: PtOperationSelectComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'pt-op-details',
    component: PtOperationDetailsComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'pt-item-scan',
    component: PtItemScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'rb-scan',
    component: RbScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'rb-form',
    component: RbFormComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'writeoff',
    component: WriteOffComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'sm-merge-from',
    component: SmMergeFromComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'sm-merge-to',
    component: SmMergeToComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'sm-confirm-merge',
    component: SmConfirmMergeComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'tr-scan',
    component: TrScanComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'tr-form',
    component: TrFormComponent,
    canActivate: [AuthGuard], // ONLY acceptable ELEVATION can access after login
    data: {
      elevation: [], // List out all roles that are acceptable
    },
  },
  {
    path: 'ocr',
    component: OCRComponent,
    canActivate: [AuthGuard],
    data: {
      elevation: [],
    },
  },
  ...AppTemplateRoutes,
];

export const AppRoutes = routes;

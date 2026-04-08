import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ScanStatistic } from '@its/shared/interfaces/frontend/ScanStatistic';
import { DEFAULT_SCANMENU } from './data';
import { StUtilsService } from '../services/st-utils.service';
import { ScanMode } from '@its/shared/services/scanmode.service';
import { StSettingsService } from '../services/st-settings.service';
import { StListService } from '../services/st-list.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { StScanMenurouterService } from '../st-scan-menurouter/st-scan-menurouter.service';
import { STStatus, StScanStorageKeys } from '../stocktaking.constants';
import { combineLatest, distinctUntilChanged, Subject, takeUntil, } from 'rxjs';
import { StScanMenuService } from '../services/stscan-menu.service';
import { StorageService } from '@dis/services/storage/storage.service';
import { StockTakeErrorStatusCodes, StSubmissionService } from '../services/st-submission.service';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { ToastService } from '@dis/services/message/toast.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { StFiltersStoreService } from '../services/st-filters-store.service';
import { StResetService } from '../services/st-reset.service';

@Component({
  selector: 'app-st-scan',
  templateUrl: './st-scan.component.html',
  styleUrls: ['./st-scan.component.scss'],
  providers: [
    StScanMenuService,
    StSubmissionService,
  ]
})
export class StScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  
  selectedScanMode: ScanMode;
  
  showSubmissionPanel: boolean = false;
  foundItemsLoaded: boolean = false;
  transactionNo: string = "";

  menuItems: ScanStatistic[] = DEFAULT_SCANMENU;
  defaultSTList: ISTItem[];

  isScanning: boolean = false;

  constructor( 
    private _router: Router,
    private _stutilsService: StUtilsService,
    private _stsettingsService: StSettingsService,
    private _stlistService: StListService,
    private ref: ChangeDetectorRef,
    private ngZone: NgZone,
    private _tagsService: ScannedTagsService,
    private _menurouterService: StScanMenurouterService,
    private _menuService: StScanMenuService,
    private _storage: StorageService,
    private _stsubmissionService: StSubmissionService,
    private customdialog: CustomDialogService,
    private _toast: ToastService,
    private _layoutService: LayoutService,
    private _stfiltersService: StFiltersStoreService,
    private _stresetService: StResetService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Stocktaking', 'st-details');

    this.foundItemsLoaded = this._stsettingsService.getLoadFoundItems();
    this.transactionNo = this._stfiltersService.storedSelectedStNo;
  }


  ngOnInit(): void { 
    const stLists$ = combineLatest({
      workingList: this._stlistService.workingSTList$,
      defaultList: this._stlistService.defaultList$,
    }).pipe(distinctUntilChanged());
    
    stLists$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (values) => {
        console.log('[st-scan] stLists$ updated', values);
        this.defaultSTList = values.defaultList;
        const totalSTItems = this.foundItemsLoaded ? this.defaultSTList : this.defaultSTList.filter(item => this._stutilsService.isPendingItem(item));
        const props = {
          total: totalSTItems,
          found: this._stutilsService.getSTListBySTStatus(values.workingList, STStatus.Found),
          misplaced: this._stutilsService.getSTListBySTStatus(values.workingList, STStatus.Misplaced),
          excess: this._stutilsService.getSTListBySTStatus(values.workingList, STStatus.Excess),
          noaccess: this._stutilsService.getSTListBySTStatus(values.workingList, STStatus.NoAccess),
          notregistered: this._stutilsService.getSTListBySTStatus(values.workingList, STStatus.NotRegistered),
        };
        console.log('[st-scan] stLists$ updated props', props);
        this.menuItems = this._menuService.updateMenu(props, this.menuItems);
        this.ref.detectChanges();
      },
      error: (error) => { console.error(error); },
    });

    this._stlistService.tagsCleared$.pipe(takeUntil(this._stresetService.destroyed$)).subscribe({
      next: () => console.log('[st-scan] clearTags detected')
    })

    this._stlistService.newScan$.pipe(takeUntil(this._stresetService.destroyed$)).subscribe({
      next: () => {
        console.log('[st-scan] newScan detected');
        this._tagsService.resetTagsService();
      }
    });
  }

  navigateTo(filter: STStatus, pageURL: string) { 
    this.ngZone.run(() => {
      this._menurouterService.setSelectedFilter(filter);
      this._router.navigate([`${pageURL}`]);
    }); 
  }

  onToggleFoundItems() { 
    this.foundItemsLoaded = !this.foundItemsLoaded;
    this._stsettingsService.setLoadFoundItems(this.foundItemsLoaded);
    this._stlistService.onLoadFoundChange(this.foundItemsLoaded);
    
    const findTotalIdx = this.menuItems.findIndex(item => item.statName === 'TOTAL');
    this.menuItems[findTotalIdx].statFilter = this.foundItemsLoaded ? STStatus.Submitted : STStatus.Pending;
  }

  onClickSubmit(): void { 
    const result = this._stsubmissionService.getStockTakeSubmission();
    const submissionFailedTitle = 'Submission Failed';
    let errorOccurred = false;
    switch(result) {
      case StockTakeErrorStatusCodes.Missing:
        this.customdialog.message(
          submissionFailedTitle, 'No scanned items were found.',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        errorOccurred = true; break; 
      case StockTakeErrorStatusCodes.UndefinedQtys:
        this.customdialog.message(
          submissionFailedTitle, 'Undefined stocktaking quantities were found.',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        errorOccurred = true; break;

      case StockTakeErrorStatusCodes.MissingSTNo:
        this.customdialog.message(
          submissionFailedTitle, 'No selected stock take number found',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        errorOccurred = true; break;
      case StockTakeErrorStatusCodes.MissingLocUpdate:
        this.customdialog.message(
          submissionFailedTitle, 'Please specify whether to submit a relocation request',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        break;
      case StockTakeErrorStatusCodes.MissingLoc:
        this.customdialog.message(
          submissionFailedTitle, 'No stock take location(s) found',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        errorOccurred = true; break;
      case StockTakeErrorStatusCodes.MissingPostItems:
        this.customdialog.message(
          submissionFailedTitle, 'No scanned stock take items found',
          [{ text: 'Close', primary: false }], 'error'
        ).subscribe({ next: () => {}});
        errorOccurred = true; break;
    }
    
    if (!errorOccurred) {
      this.showSubmissionPanel = true;
    }
  }

  onClear(e: boolean) {
    if (e) {
      this._storage.removeItem(StScanStorageKeys.postSTItems); /* Nothing to submit if no items are scanned */
    }
  }

  onClose(closeType: 'cancel'|'submit') { 
    this.showSubmissionPanel = false; 

    if (closeType === 'submit') {
      this._stsubmissionService.postStocktaking().pipe(takeUntil(this.destroyed$)).subscribe({
        next: (res) => { 
          console.log('Stocktaking submission posted'); 
          if (res.primary) {
            this._tagsService.resetTagsService(); /* clear for reuse by other components */
            this._router.navigate(['/st-details']);
          }
        }
      });
    }
  }

  refresh() {
    this._stlistService.setDefaultList();
    this._toast.success('Stocktake list reloaded', 1500);
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

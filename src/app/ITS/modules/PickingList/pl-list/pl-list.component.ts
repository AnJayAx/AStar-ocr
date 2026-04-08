import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { Utils } from '@its/shared/classes/utils';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IPLOrderItem } from '@its/shared/interfaces/frontend/PLOrderItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { RefreshService } from '@its/shared/services/refresh.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { combineLatest, concatMap, distinctUntilChanged, filter, map, Observable, of, Subject, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import { PlFifoService } from '../services/pl-fifo.service';
import { PlSelectedOrderService } from '../services/pl-selected-order.service';
import { PlSubmissionService } from '../services/pl-submission.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IPackageMaster } from '@its/shared/interfaces/backend/SPT_Doc/PackageMaster';
import { faBoxesPacking, faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ReloadComponentService } from '@its/shared/services/reload-component.service';
import { PlInvalidtagsService } from '../services/pl-invalidtags.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { PlResetService } from '../services/pl-reset.service';
import { PlScanService } from '../services/pl-scan.service';
import { IS_M_FULLY_PICKED_SETTING_KEY, PICK_N_COMPLETE_KEY } from '@its/shared/constants/lptkeys.constants';
import { IPlOrderInfo } from '@its/shared/interfaces/backend/SPT_Doc/PlOrderInfo';
import { PickingListUtils } from '../pickinglist-utils';
import { IPLListItem } from '@its/shared/interfaces/frontend/PLListItem';
import { CommonStoreService } from '@its/shared/services/common-store.service';

@Component({
  selector: 'app-pl-list',
  templateUrl: './pl-list.component.html',
  styleUrls: ['./pl-list.component.scss'],
  providers: [ PlFifoService ]
})
export class PlListComponent implements OnInit, OnDestroy {
  DialogCloseEventType = DialogCloseEventType;
  boxIcon = faBoxesPacking;
  checkIcon = faCheckCircle;
  crossIcon = faCircleXmark;
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef;
  reloadComponent: any;

  orderInfoList$: Observable<IPlOrderInfo[]> = this._itsService.getAvailableOrdersInfo();
  selectedOrderInfo: IPlOrderInfo;
  private userSelectedOrderItem: IPLOrderItem; 

  searchTerm: string = '';
  viewPickingList: IPLListItem[];

  isPickAndPack: boolean = false;
  isPickAndComplete: boolean = null;
  showPackingPanel: boolean = false;
  packageForm: FormGroup = new FormGroup({
    packageId: new FormControl(null, Validators.required),
    weight: new FormControl(null)
  });
  packageList: IPackageMaster[];
  selectedPackage: IPackageMaster;
  
  showSubmissionPanel: boolean = false;

  isMFullyPicked$: Observable<boolean> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getLPTValueByKey(IS_M_FULLY_PICKED_SETTING_KEY)),
    filter(value => !!value),
    map(isMFullyPicked => { return isMFullyPicked.toLowerCase()==='yes' ? true : false; })
  );

  isPickAndComplete$: Observable<boolean> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getLPTValueByKey(PICK_N_COMPLETE_KEY)),
    filter(value => !!value),
    map(isPickAndComplete => { return isPickAndComplete.toLowerCase()==='yes' ? true : false })
  )

  get pickingType(): string {
    return this.userSelectedOrderItem?.IsNormalPicking ? "DO" : "Transfer";
  }

  get isConfirmDisabled(): boolean {
    return this._plsubmissionService.isSubmissionItemsAvailable() === false;
  }

  constructor(
    private ref: ChangeDetectorRef,
    private _router: Router,
    private _selectedorderService: PlSelectedOrderService,
    private customDialog: CustomDialogService,
    private _refresh: RefreshService,
    private _tagsService: ScannedTagsService,
    private _plscanService: PlScanService,
    private _plsubmissionService: PlSubmissionService,
    private _reload: ReloadComponentService,
    private elemRef: ElementRef,
    private _plinvalidtagsService: PlInvalidtagsService,
    private _layoutService: LayoutService,
    private _plresetService: PlResetService,
    private _commonstore: CommonStoreService,
    private _itsService: ItsServiceService,
  ) {    
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Picking List', 'mainmenunew');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;

    this._plresetService.initPlModule();

    this.subscribeToPlScannedTags();

    this._plinvalidtagsService.invalidTagsDialog$().pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (dialog) => {
        if (!!dialog) { this._plinvalidtagsService.onInvalidTagsViewed(); }
        this._tagsService.resetTagsService(); /* ensure invalid tags have been processed before resetting */
      }
    });

    this.isPickAndComplete$.pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (isPickAndComplete) => this.isPickAndComplete = isPickAndComplete
    });
  }

  private subscribeToPlScannedTags(): void {
    combineLatest({
      plListScannedTags: this._plscanService.plListScannedTags$,
      isMFullyPicked: this.isMFullyPicked$
    })
    .pipe(
      filter(values => values.plListScannedTags.length > 0),
      takeUntil(this.destroyed$),
      distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
      tap(values => console.log('[pl-list] values', values)),
      withLatestFrom(this._selectedorderService.selectedOrderItem$),
      tap(values => {
        const selectedOrderItem = values[1];
        if (!selectedOrderItem) {
          alert('Select an order item before scanning');
        }
      }),
      filter(values => !!values[1]),
      map(values => values[0]),
      concatMap(values => this._itsService.postItemsByEpcId(values.plListScannedTags.map(tag => { return {"EPC_ID": tag}; })).pipe(map(itemInfoArr => { return { ...values, itemInfoArr: itemInfoArr }; })))
    )
    .subscribe({
      next: (values) => {
        console.log('[pl-list] subscription values', values);
        const scannedTags = values.plListScannedTags;
        let itemInfoResult = values.itemInfoArr;
        const isMFullyPicked = values.isMFullyPicked;

        let mItemEPCs = [];

        const registeredEPCs = itemInfoResult.map(item => item.EPC_ID);
        const unregisteredEPCs = scannedTags.filter(epc => !registeredEPCs.includes(epc));
        console.log('[pl-list] unregisteredEPCs', unregisteredEPCs);

        if (itemInfoResult.length > 0) {
          if (!this.userSelectedOrderItem.IsNormalPicking) {
            mItemEPCs = itemInfoResult.filter(item => item.IsIndividual.toLowerCase()==='m').map(item => item.EPC_ID);
            itemInfoResult = itemInfoResult.filter(item => !mItemEPCs.includes(item.EPC_ID));
            console.log('[pl-list] !isNormalPicking > mItemEPCs', mItemEPCs);
          }

          const unavailableEPCs = itemInfoResult.filter(item => item.Asset_StatusName.toLowerCase() === 'notavailable').map(item => item.EPC_ID);
          console.log('[pl-list] unavailable EPCs', unavailableEPCs);
                
          const preprocessInvalidTags = [...new Set(unregisteredEPCs.concat(unavailableEPCs).concat(mItemEPCs))];
          const sanitizedItemsInfo = itemInfoResult.filter(item => !unavailableEPCs.includes(item.EPC_ID));
          this._selectedorderService.updateOrderItemOnScan(sanitizedItemsInfo, preprocessInvalidTags, isMFullyPicked);
        } else {
          const mismatchedEPCs = this._selectedorderService.getMismatchedEPCs();
          const invalidTags = [...new Set(unregisteredEPCs.concat(mismatchedEPCs))];
          this._plinvalidtagsService.setInvalidTags(invalidTags);
        }
      }
    })
  }

  ngOnInit(): void {

    this.subscribeToListUpdates();

    this._plsubmissionService.isPickAndPack$
    .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
    .subscribe({
      next: (isPickAndPack) => this.isPickAndPack = isPickAndPack
    });

    this._plsubmissionService.isPickAndPack$
    .pipe(
      takeUntil(this.destroyed$), distinctUntilChanged(),
      switchMap(isPickAndPack => isPickAndPack ? this._plsubmissionService.packages$ : of(null)),
    )
    .subscribe({
      next: (packages) => {
        if (!!packages) {
          this.packageList = packages;
          this.selectedPackage = this.packageList[0];
          this._plsubmissionService.onPackageUpdate(this.selectedPackage.Package_Master_ID, null);
        }
      }
    });

    this._plsubmissionService.isPickAndPack$
    .pipe(
      takeUntil(this.destroyed$),
      switchMap(isPickAndPack => isPickAndPack ? this.packageForm.valueChanges : of(null)),
      filter(changes => !!changes),
    )
    .subscribe({
      next: (changes) => {
        console.log('[pl-list] packageFormValueChanges', changes);
        console.log('[pl-list] selected package', this.selectedPackage);

        this.selectedPackage = changes.packageId as IPackageMaster;
        this._plsubmissionService.onPackageUpdate(changes.packageId['Package_Master_ID'], changes.weight);
        this.ref.detectChanges();
      }
    });
  }

  private subscribeToListUpdates() {
    const orderStates = {
      orderInfoList: this.orderInfoList$,
      userSelectedOrderItem: this._selectedorderService.selectedOrderItem$
    };

    this._refresh.refreshToken$.pipe(
      takeUntil(this.destroyed$),
      switchMap(() => combineLatest(orderStates)),
      filter(values => !!values.orderInfoList),
      distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
    ).subscribe({
      next: (values) => {
        console.log('[pl-list] orderStates updated', values);
        if (!!values.userSelectedOrderItem) {
          this.userSelectedOrderItem = values.userSelectedOrderItem;
          this.viewPickingList = this.userSelectedOrderItem.PickingList.slice();
          this.selectedOrderInfo = values.orderInfoList.find(orderInfoItem => orderInfoItem.ID === this.userSelectedOrderItem.Verification_ID.toString());
        } else {
          this.userSelectedOrderItem = null;
          this.viewPickingList = null;
          this.selectedOrderInfo = null;
        }
      }
    });

  }

  handleSelectedOrderChange(selected: IPlOrderInfo) {
    this.onReload();

    this.selectedOrderInfo = selected;
    console.log('[pl-list] handleSelectedOrderChange selected', this.selectedOrderInfo);
    this._itsService.getOrderByVerificationId(this.selectedOrderInfo.ID)
    .pipe(
      takeUntil(this.destroyed$),
      take(1),
      tap(order => console.log('[pl-list] getOrderByVerificationId', order)),
      map(order => PickingListUtils.orderToOrderItem(order[0]))
    )
    .subscribe({
      next: (newOrderItem) => {
        console.log('[pl-list] setSelectedOrderItem', newOrderItem);
        this._selectedorderService.setSelectedOrderItem(newOrderItem);
        this._tagsService.clearScannedTags();
        this._plsubmissionService.clearSubmission();
      }
    });
  }

  handleFilterChange(searchInput: string) {
    // listview.skip = 0;

    const normalized = (input: string) => { return input?.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchInput);

    const filterExpression = (item: IPLListItem) => {
      return normalized(item.Category)?.includes(normalizedQuery)
        || normalized(item.Description)?.includes(normalizedQuery)
        || normalized(item.Date_of_Expire)?.includes(normalizedQuery)
        || normalized(item.BatchNo)?.includes(normalizedQuery)
        || normalized(item.Location?.map(location => location?.Location_Name).toString()).includes(normalizedQuery) /* search query compared with stringified array of location names */
        || normalized(item.UOM)?.includes(normalizedQuery)

        /* allow search by item picked and required quantities */
        || normalized(item._picked.toFixed(2))?.includes(normalizedQuery)
        || normalized(item.Qty.toFixed(2))?.includes(normalizedQuery);
    }

    this.viewPickingList = this.userSelectedOrderItem.PickingList.filter(filterExpression);
  }

  onClearSearchFilter() {
    this.searchTerm = '';
    this.viewPickingList = this.userSelectedOrderItem.PickingList.slice();
  }

  onClear(cleared: boolean) {
    if (cleared) {
      this._plsubmissionService.clearSubmission();
      this._plinvalidtagsService.setInvalidTags([]);
      this.handleSelectedOrderChange(this.selectedOrderInfo);
    }
  }    

  onConfirm(): void {
    if (this._plsubmissionService.isMItemQtysVerified() === false) {
      this.customDialog.messageHTML(
        'Undefined Quantities',  `Continue with zero picking quantities?<br/>The following items will be removed:<br/>${Utils.getUnorderedListHTML(this._plsubmissionService.getDisplayInvalidEPCs())}`,
        [{ text: 'No', primary: false }, { text: 'Yes', primary: true }], 'warning'
      ).subscribe({
        next: response => this.showSubmissionPanel = response.primary
      });
    }

    else if (this.isPickAndPack) {
      this.showPackingPanel = true;
    }
    
    else {
      this.showSubmissionPanel = true;
      console.log('[pl-list] this._selectedorderService.currentSubmissionScanItems', this._selectedorderService.currentSubmissionScanItems);
    }
  }

  onPackageClose(eventType: DialogCloseEventType): void {
    if (eventType === DialogCloseEventType.Cancel) { 
      this.packageForm.reset();
      this.showPackingPanel = false;
    }

    else if (eventType === DialogCloseEventType.Confirm) {
      this.packageForm.markAllAsTouched();
      this.showPackingPanel = false;
      this.showSubmissionPanel = true;
    }

    else {
      this.showPackingPanel = false;
    }
  }

  onSubmissionClose(eventType: DialogCloseEventType): void {
    this.showSubmissionPanel = false;
    if (eventType === DialogCloseEventType.Cancel) { return; }

    const destinationCompanyId = this.userSelectedOrderItem.IsNormalPicking ? this._commonstore.currentUserCompany.company_ID : this.userSelectedOrderItem.Customer_ID;
    this._plsubmissionService.postPickingListToServerAndBlockchain(this._selectedorderService.currentSubmissionScanItems, destinationCompanyId)    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (response) => {
        if (response.primary) {
          const currentURL = this._router.url;
          this._router.navigate(['/'], { skipLocationChange: true }).then(() => {
          this._router.navigate([`/${currentURL}`]).then(() => {
              console.log('component has been reloaded');
              this.onReload();
              this._refresh.refresh();
            });
          });
        }
      }
    });
  }

  onReload() {
    this._plsubmissionService.clearSubmission();
    this._tagsService.resetTagsService();
    this._plinvalidtagsService.onInvalidTagsViewed();
    this._selectedorderService.setSelectedOrderItem(undefined);
    this._refresh.refresh();      
  }

  showList(): boolean { return !!this.userSelectedOrderItem && !!this.userSelectedOrderItem.PickingList && !!this.viewPickingList; }
  searchIsEmpty(): boolean { return this.showList && this.userSelectedOrderItem.PickingList.length > 0 && this.viewPickingList.length === 0; }
  listIsEmpty(): boolean { return this.userSelectedOrderItem?.PickingList?.length == 0; }

  handleSelectedPackageChange(selectedPackage: IPackageMaster) {
    this.selectedPackage = selectedPackage; 
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$.unsubscribe();
  }
}

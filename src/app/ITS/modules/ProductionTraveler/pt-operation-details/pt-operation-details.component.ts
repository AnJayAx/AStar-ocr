import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ReloadComponentService } from '@its/shared/services/reload-component.service';
import { PT_OPERATION_FORM } from '../production-traveler.constants';
import { faCircleCheck, faExclamationCircle, faFloppyDisk, faTags, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ProductionTravelerService } from '../services/production-traveler.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { PtSubmissionStoreService } from '@its/modules/ProductionTraveler/services/pt-submission-store.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { ISimpleBom } from '@its/shared/interfaces/backend/SimpleBom';
import { Subject, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { PtOperationDetailsStoreService } from '../services/pt-operation-details-store.service';
import { PtOperationDetailsToastService } from '../services/pt-operation-details-toast.service';
import { PtOperationSelectStoreService } from '../services/pt-operation-select-store.service';

@Component({
  selector: 'app-pt-operation-details',
  templateUrl: './pt-operation-details.component.html',
  styleUrls: ['./pt-operation-details.component.scss']
})
export class PtOperationDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroyed$: Subject<boolean> = new Subject();
  tagsIcon = faTags;
  reloadElemRef: ElementRef;
  reloadComponent: any;
  @ViewChild("dialogToastContainer", { read: ViewContainerRef })
  public dialogToastContainer: ViewContainerRef;

  selectedSku: string;

  operationForm: FormGroup = this._ptOpDetailsStore.operationFormState;
  categoryList: string[] = [];
  workcenterList: ILocations[] = [];
  expirationMonths: number;

  showEpcScanDialog: boolean = this._ptOpDetailsStore.showEpcScanDialogState;

  checkIcon = faCircleCheck;
  warningIcon = faExclamationCircle;
  saveIcon = faFloppyDisk;
  deleteIcon = faTrashCan;
  numOfTagsNeeded: number = this._ptOpDetailsStore.numOfTagsNeededState;

  invalidTags: string[] = [];

  scannedTags: string[] = this._ptOpDetailsStore.scannedTagsState;
  displayScannedTags: string[] = this._ptOpDetailsStore.displayScannedTagsState;

  showBomPanel: boolean = this._ptOpDetailsStore.showBomPanelState;
  selectedOperationId: number = this._ptOpDetailsStore.selectedOperationIdState;

  showSubmissionPanel: boolean = false;

  constructor(
    private _layoutService: LayoutService,
    private elemRef: ElementRef,
    private route: ActivatedRoute,
    private _reload: ReloadComponentService,
    private _ptService: ProductionTravelerService,
    private _store: PtSubmissionStoreService,
    private _ptOpDetailsStore: PtOperationDetailsStoreService,
    private _tagsService: ScannedTagsService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _customtoast: PtOperationDetailsToastService,
    private _ptopselectStore: PtOperationSelectStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('First Operation', 'pt-op-select');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;

    console.log('[pt-operation-details] get operation form state', this.operationForm);

    /* if it is the first time loading the form, reset form to load default data */
    if (this._ptOpDetailsStore.isDefaultOperationForm) {
      this.resetForm();
    }

    this.onToggleIsRunningBatchNo();
  }

  get disableConfirmation(): boolean {
    return !this.operationForm?.valid || this.showWarningIcon || this.showQtyErrorMsg;
  }
  get showCheckIcon(): boolean { 
    return this.displayScannedTags.length === this.numOfTagsNeeded; 
  }
  get showWarningIcon(): boolean {
    return this.showEpcScanButton && this.displayScannedTags.length !== this.numOfTagsNeeded;
  }
  get hideBatchNoInput(): boolean {
    return this.operationForm?.get('isRunningBatchNo').value;
  }
  get showEpcScanButton(): boolean {
    return this.operationForm?.get('isAutoRunningEpcId').value === false;
  }
  get disableToggleScanWindow(): boolean {
    return this.numOfTagsNeeded <= 0;
  }
  get showQtyErrorMsg(): boolean {
    return this.operationForm?.get('confirmedQty').value < this.operationForm?.get('packingQty').value;
  }
  private get qtysDefined(): boolean {
    return !!this.operationForm?.get('confirmedQty').value && !!this.operationForm?.get('packingQty').value;
  }

  ngOnInit(): void {
    this._ptService.getAllCategoryName()
    .subscribe({
      next: (categories) => {
        this.categoryList = categories;
        if (!this.operationForm.get('category').value) {
          this.operationForm.controls['category'].setValue(this.categoryList[0]);
        }
      }
    });

    this._ptService.getAllLocations()
    .subscribe({
      next: (locations) => {
        this.workcenterList = locations;
        if (!this.operationForm.get('workCenter').value) {
          this.operationForm.controls['workCenter'].setValue(this.workcenterList[0]);
        }
      }
    });

    this.selectedSku = this.route.snapshot.paramMap.get("sku");
    this.selectedOperationId = this._store.currentFirstOperationOperationId;
    console.log('[pt-operation-details] selectedOperationId', this.selectedOperationId);

    this._ptService.getProductNameBySku(this.selectedSku)
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (productName) => {
        this.operationForm.controls['description'].setValue(productName);
      }
    });

    this._ptService.getExpirationMonthsBySku(this.selectedSku)
    .pipe(filter(months => !!months))
    .subscribe({
      next: (months) => {
        console.log('[pt-operation-details] expiration months', months);
        this.expirationMonths = months;

        const defaultManufacturingDate: Date = new Date(this.operationForm.get('manufacturingDate').value) || new Date();
        const defaultExpiryDate = new Date(defaultManufacturingDate.setMonth(defaultManufacturingDate.getMonth() + this.expirationMonths));
        this.operationForm.controls['expiryDate'].setValue(defaultExpiryDate);
        console.log('manufacturingDate after', this.operationForm.get('manufacturingDate').value);

      }
    });

    this.operationForm.valueChanges
    .pipe(takeUntil(this.destroyed$), distinctUntilChanged((prev, current) => JSON.stringify(prev) === JSON.stringify(current)))
    .subscribe({
      next: () => {
        console.log('[pt-operation-details] operation form', this.operationForm);
        if (this.qtysDefined && !this.showQtyErrorMsg) {
          this.numOfTagsNeeded = Math.ceil(this.operationForm.get('confirmedQty').value as number / this.operationForm.get('packingQty').value as number);
        } else {
          this.numOfTagsNeeded = 0;
        }
        this.onToggleIsRunningBatchNo();
        this.ref.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    /* For scan EPC dialog only */
    this._ptService.incomingTagValues$
    .pipe(takeUntil(this.destroyed$), filter(() => this.showBomPanel===false && this.showEpcScanDialog===true))
    .subscribe({
      next: (values) => {
        console.log('[pt-operation-details] incomingTagValues$', values);
        values.validTags.forEach(tag => {
          if (!this.scannedTags.includes(tag)) { this.scannedTags.push(tag); }
        });
        this.displayScannedTags = [...this.scannedTags];

        this.invalidTags = values.existingTags;
        console.log('[pt-operation-details] invalid tags', this.invalidTags);

        this._ptOpDetailsStore.updateScannedTagsState(this.scannedTags);
        console.log('[pt-operation-details] scannedTags updated', this.scannedTags);
        console.log('[pt-operation-details] displayScannedTags updated', this.displayScannedTags);

        this.ref.detectChanges();
        this._tagsService.resetTagsService();
      } 
    });
  }

  closeInvalidTagsDialog(): void { this.invalidTags = []; }

  onToggleIsRunningBatchNo() {
    if (this.operationForm.get('isRunningBatchNo').value) {
      this.operationForm.get('batchNo').clearValidators();
    } else {
      this.operationForm.get('batchNo').setValidators([Validators.required]);
    }
    this.operationForm.controls['batchNo'].updateValueAndValidity();

    console.log('[pt-operation-details] onToggleIsRunningBatchNo', this.operationForm);
  }

  resetForm() {
    console.log('[pt-operation-details] resetForm');
    this.operationForm = PT_OPERATION_FORM;
    this.operationForm.reset();
    this.operationForm.controls['category'].setValue(this.categoryList[0]);
    this.operationForm.controls['workCenter'].setValue(this.workcenterList[0]);
    this.operationForm.controls['manufacturingDate'].setValue(new Date());
    this.operationForm.controls['isRunningBatchNo'].setValue(false);
    this.operationForm.controls['isAutoRunningEpcId'].setValue(false);

    if (!!this.expirationMonths) {
      this.operationForm.controls['expiryDate'].setValue(new Date().setMonth(new Date().getMonth() + this.expirationMonths));
    }

    this.operationForm.updateValueAndValidity();

    this.showEpcScanDialog = false;
    this.scannedTags = [];
    this.displayScannedTags = [];
    this.numOfTagsNeeded = 0;
    this.onToggleIsRunningBatchNo();
  }

  onReload(reloaded: boolean) {
    if (reloaded) {
      this._reload.reloadComponent(this.reloadComponent, this.reloadElemRef);
      this._store.reset();
    }
  }

  toggleEpcScanWindow(confirmScan: boolean = false): void {
    this.showEpcScanDialog = !this.showEpcScanDialog;
    this.showBomPanel = false;
    if (confirmScan) {
      this.scannedTags = [...this.displayScannedTags];
    } else {
      /* Revert any deletions that the user made */
      this.displayScannedTags = [...this.scannedTags];
    }
  }

  onDeleteTag(deleteTag: string): void {
    this.displayScannedTags = this.displayScannedTags.filter(tags => tags !== deleteTag);
  }

  onClearEpcScan(cleared: boolean) {
    if (cleared) {
      this.scannedTags = [];
      this.displayScannedTags = [];
    }
  }

  onConfirm(): void {
    if (this.operationForm.get('isAutoRunningEpcId').value) {
      this._store.setFirstOperationEPCs([]);
    } else {
      this._store.setFirstOperationEPCs(this.displayScannedTags);
    }
    this._tagsService.resetTagsService(); /* clear up any tags before entry into bom panel */
    this._store.setFirstOperationFormInfo(this.operationForm);
    this.showBomPanel = true;
  }

  onCloseBomPanel(bomCloseEvent: {closeEvent: DialogCloseEventType, outputBom: ISimpleBom[]}) {
    this.showBomPanel = false;
    if (bomCloseEvent.closeEvent === DialogCloseEventType.Confirm) {
      this._store.setFirstOperationBOM(bomCloseEvent.outputBom);
      this.showSubmissionPanel = true;
    } else {
      this.showSubmissionPanel = false;
    }
  }

  onCloseSubmissionPanel(closeEvent: DialogCloseEventType) {
    if (closeEvent === DialogCloseEventType.Submit) {
      this._ptService.postFirstOperationToServerAndBlockchain(this._store.currentFirstOperation, this._ptopselectStore.selectedSkuItemTraitsState)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.primary) {
            this._store.reset();
            this.router.navigateByUrl('pt-op-select');
          }
        }
      });
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    
    this._ptOpDetailsStore.updateOperationFormState(this.operationForm);
    this._ptOpDetailsStore.updateShowEpcScanDialogState(this.showEpcScanDialog);
    this._ptOpDetailsStore.updateNumOfTagsNeededState(this.numOfTagsNeeded);
    this._ptOpDetailsStore.updateScannedTagsState(this.scannedTags);
    this._ptOpDetailsStore.updateDisplayScannedTagsState(this.displayScannedTags);
    this._ptOpDetailsStore.updateShowBomPanelState(this.showBomPanel);
    this._ptOpDetailsStore.updateSelectedOperationIdState(this.selectedOperationId);
  }
}

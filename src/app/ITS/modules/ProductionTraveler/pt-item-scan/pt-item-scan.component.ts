import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { IProductionTravelerItemInfo } from '@its/shared/interfaces/backend/ProductionTravelerItemInfo';
import { Subject, filter, take, takeUntil } from 'rxjs';
import { ProductionTravelerService } from '../services/production-traveler.service';
import { PtSubmissionStoreService } from '@its/modules/ProductionTraveler/services/pt-submission-store.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { faCheckCircle, faLocationDot, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Utils } from '@its/shared/classes/utils';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { ISimpleBom } from '@its/shared/interfaces/backend/SimpleBom';
import { IBom } from '@its/shared/interfaces/backend/Bom';
import { ToastService } from '@dis/services/message/toast.service';
import { IQcInfo } from '@its/modules/ProductionTraveler/services/pt-submission-store.service';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { PtItemScanStoreService } from '../services/pt-item-scan-store.service';
import { PtOperationSelectStoreService } from '../services/pt-operation-select-store.service';

const SELECT_TEXT = 'Select All';
const UNSELECT_TEXT = 'Unselect All';

@Component({
  selector: 'app-pt-item-scan',
  templateUrl: './pt-item-scan.component.html',
  styleUrls: ['./pt-item-scan.component.scss']
})
export class PtItemScanComponent implements OnInit, OnDestroy {
  locationIcon = faLocationDot;
  validIcon = faCheckCircle;
  invalidIcon = faWarning;
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef;
  reloadComponent: any;
  @ViewChild('listview') listview;
  
  selectedSku: string;

  dataList: IProductionTravelerItemInfo[] = this._ptItemScanStore.operationTravelerDataListState;
  viewDataList: IProductionTravelerItemInfo[] = [...this.dataList];
  selectedItems: IProductionTravelerItemInfo[] = [];
  selectionText: string;

  location: ILocations = this._ptItemScanStore.operationTravelerLocationState;

  selectedOperationId: number = this._ptItemScanStore.operationTravelerOperationIdState;
  isQcOperation: boolean = false;
  showQcPanel: boolean = false;
  showBomPanel: boolean = this._ptItemScanStore.operationTravelerShowBomPanelState;
  inputBomList: IBom[] = this._ptItemScanStore.operationTravelerInputBomListState;
  showSubmissionPanel: boolean = false;
  
  constructor(
    private _customdialog: CustomDialogService,
    private _layoutService: LayoutService,
    private elemRef: ElementRef,
    private route: ActivatedRoute,
    private _ptService: ProductionTravelerService,
    private _store: PtSubmissionStoreService,
    private _toast: ToastService,
    private _tagsService: ScannedTagsService,
    private router: Router,
    private _ptItemScanStore: PtItemScanStoreService,
    private _ptOpSelectStore: PtOperationSelectStoreService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Operation Traveler', 'pt-op-select');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;

    this.loadSelectionText();

    this.selectedSku = this.route.snapshot.paramMap.get("sku");
    this._ptService.getAllOperationsBySku(this.selectedSku)
    .pipe(take(1))
    .subscribe({
      next: (allOps) => {
        if (allOps.length < 2) {
          console.log('[pt-operation-select] getAllOperationsBySku', allOps);
          this._customdialog.message(
            `Insufficient Operations`,
            `Create at least two operations for ${this.selectedSku} to continue.`,
            [{text: 'Back', primary: true}],
            'error'
          ).subscribe({
            next: (response) => {
              if (response.primary) { this.router.navigate(['pt-op-select']); }
            }
          });
        }
      }
    });

  }

  get confirmBtnDisabled(): boolean {
    return this.dataList.length === 0 || this.isItemScanListValid === false || this.selectedItems.length === 0;
  }

  get isItemScanListValid(): boolean {
    if (this.dataList.length <= 1) { return true; }
    else {
      return this._ptService.isIncomingProductionTravelerItemsValid(this.dataList[0], this.dataList.slice(1, this.dataList.length));
    }
  }

  get itemListTotal(): string {
    return this._ptService.getProductionTravelerScanListTotal(this.dataList)?.toFixed(2);
  }

  onReloadClicked(reloaded: boolean) {
    if (reloaded) {
      console.log('[pt-item-scan] reloaded');
      this.location = null;
      this.dataList = []; 
      this.viewDataList = [];
      this.selectedItems = [];
      this._ptItemScanStore.reset();
    }
  }

  ngOnInit(): void {
    this._ptService.incomingProductionTravelerItems$
    .pipe(
      takeUntil(this.destroyed$),
      filter(scanItems => scanItems.length > 0 && this.showBomPanel === false)
    )
    .subscribe({
      next: (scanItems) => {
        console.log('[pt-item-scan] incomingProductionTravelerItems', scanItems);
        let isFound = false;
        const existingEpcs = this.dataList.map(item => item.EPC_ID);
        scanItems.forEach(scanItem => {
          if (scanItem.SKU === this.selectedSku && !existingEpcs.includes(scanItem.EPC_ID)) { /* Incoming scan items must have the same SKU as selectedSKU */
            this.dataList.push(scanItem);
            isFound = true;
          }
        });
        this.viewDataList = [...this.dataList];
        console.log('[pt-item-scan] dataList', this.dataList);
        if (!isFound) { this._toast.default('No matching items found.') }
        this._tagsService.resetTagsService();
      }
    });
  }

  onSelectedLocationChanged(selectedLocation: ILocations) { this.location = selectedLocation; }

  handleFilterChange(searchInput: string, listview) {
    listview.skip = 0;

    const normalized = (input: string) => { return input.replace(' ','').toLowerCase(); }
    const normalizedQuery = normalized(searchInput);

    const filterSM = (item: IProductionTravelerItemInfo) => {
      const itemSM = item.IsIndividual.toUpperCase();
      return normalized(itemSM) === normalizedQuery;
    }

    const filterExpression = (item: IProductionTravelerItemInfo) => {
      return normalized(Utils.removeNullValue(item.SKU)).includes(normalizedQuery)
        || normalized(Utils.removeNullValue(item.BatchNo)).includes(normalizedQuery)
        || normalized(Utils.removeNullValue(item.CO.OpAc).toString()).includes(normalizedQuery)
        || normalized(Utils.removeNullValue(item.CO.Operation_short_text)).includes(normalizedQuery)
        || normalized(Utils.removeNullValue(item.NO.OpAc).toString()).includes(normalizedQuery)
        || normalized(Utils.removeNullValue(item.NO.Operation_short_text)).includes(normalizedQuery)
        || normalized(item.EPC_ID).includes(normalizedQuery);
    }

    this.viewDataList = this.dataList.filter(filterExpression);
  }

  onDeleteItem(deleteItem: IProductionTravelerItemInfo): void {
    this.selectedItems = this.selectedItems.filter(item => item.EPC_ID !== deleteItem.EPC_ID);
    this.dataList = this.dataList.filter(item => item.EPC_ID !== deleteItem.EPC_ID);
    this.viewDataList = this.viewDataList.filter(item => item.EPC_ID !== deleteItem.EPC_ID);
  }

  isSelectedItem(item: IProductionTravelerItemInfo): boolean {
    return this.selectedItems.map(item => item.EPC_ID).includes(item.EPC_ID);
  }

  onClickItem(e: {isSelected: boolean, item: IProductionTravelerItemInfo}): void {
    if (e.isSelected) {
      const selectedItem = this.dataList.find(item => item.EPC_ID === e.item.EPC_ID);
      if (!!selectedItem) {
        this.selectedItems.push(selectedItem);
      } else {
        console.error('Error occurred selectedItem not found', selectedItem);
        return; 
      }
    } else {
      this.selectedItems = this.selectedItems.filter(item => item.EPC_ID !== e.item.EPC_ID);
    }
    this.loadSelectionText();
  }

  private loadSelectionText(): void {
    if (!!this.selectedItems && this.selectedItems.length != 0) { this.selectionText = UNSELECT_TEXT; }
    else { this.selectionText = SELECT_TEXT; }
  }

  onSelectionBtnClick(): void {
    if (this.selectedItems.length != 0) { this.selectedItems = []; }
    else { this.selectedItems = [...this.dataList]; }
    this.loadSelectionText();
  }

  onDeleteSelection(): void {
    const dialog$ = this._customdialog.message(
      'Delete selected items?',
      `${this.selectedItems.length} item(s) selected`,
      [{text: 'Yes', primary: true}, { text: 'No', primary: false}],
      'error');

    dialog$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (res: any) => {
        if (res.primary) {
          const selectedEpcIds = this.selectedItems.map(x => x.EPC_ID);
          this.dataList = [...this.dataList.filter(x => !selectedEpcIds.includes(x.EPC_ID))];
          this.viewDataList = [...this.dataList];
          this.selectedItems = [...this.selectedItems.filter(x => !selectedEpcIds.includes(x.EPC_ID))];
          this.loadSelectionText();
        }
      },
      error: (error) => { console.error(error); }
    });
  }

  onClear(isCleared: boolean) {
    if (isCleared) {
      this.dataList = [];
      this.viewDataList = [];
      this.selectedItems = [];
      this.loadSelectionText();
    }
  }

  onClearLocation(): void { this.location = null; }

  onClickConfirm(): void {
    if (!!this.location) {
      this._store.setOperationTravelerLocation(this.location);
    }
    this._store.setOperationTravelerOperation(this.dataList[0].CO); /* use operation information from first item in bom list */
    this.selectedOperationId = this._store.currentOperationTravelerOperationId;
    this.isQcOperation = this._ptService.qcTypeToBool(this._store.currentOperationTravelerQcType);
    console.log('[pt-item-scan] isQcOperation', this.isQcOperation);

    if (this.selectedOperationId === null || this.isQcOperation === null) {
      console.error('[pt-item-scan] Unable to retrieve operation Id or QC type');
      return;
    } 

    this._store.setOperationTravelerItems(this.dataList);
    this._store.setOperationTravelerWorkOrder(this.dataList[0].Ref_No); /* Temporarily use Ref_No to store WO */

    this._ptService.getBomByOperationId(this.selectedOperationId).subscribe({
      next: (incomingBom) => {
        if (incomingBom?.length > 0) {
          this.inputBomList = incomingBom;
          this.showBomPanel = true;
        } else {
          this.showBomPanel = false;
          if (this.isQcOperation) { this.showQcPanel = true; this.showSubmissionPanel = false; }
          else { this.showSubmissionPanel = true; }
        }
      }
    });
  }

  onCloseBomPanel(bomOutputEvent: {closeEvent: DialogCloseEventType, outputBom: ISimpleBom[]}) {
    this.showBomPanel = false;
    if (bomOutputEvent.closeEvent === DialogCloseEventType.Confirm) {
      this._store.setOperationTravelerBOM(bomOutputEvent.outputBom);
      this.showQcPanel = this.isQcOperation;
      this.showSubmissionPanel = !this.showQcPanel;
      this._tagsService.resetTagsService(); /* Prevent leakage of data to bom panel */
    } else {
      this.showQcPanel = false;
      this.showSubmissionPanel = false;
    }
  }

  onCloseQcDialog(qcDialogCloseEvent: {closeEvent: DialogCloseEventType, isBack: boolean, outputQcInfo: IQcInfo}) {
    this.showQcPanel = false;
    if (qcDialogCloseEvent.closeEvent === DialogCloseEventType.Confirm) {
      this._store.setOperationTravelerQcInfo(qcDialogCloseEvent.outputQcInfo);
      this.showBomPanel = false;
      this.showSubmissionPanel = true;
    }
    else if (qcDialogCloseEvent.closeEvent === DialogCloseEventType.Cancel && qcDialogCloseEvent.isBack) {
      this.showBomPanel = true;
      this.showSubmissionPanel = false;
    }
  }
  onCloseSubmissionPanel(closeEvent: DialogCloseEventType) {
    if (closeEvent === DialogCloseEventType.Submit) {
      this._ptService.postOperationTravelerToServerAndBlockchain(this._store.currentOperationTraveler, this.dataList, this._ptOpSelectStore.selectedSkuItemTraitsState)
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
    this._ptItemScanStore.updateOperationTravelerLocation(this.location);
    this._ptItemScanStore.updateOperationTravelerDataList(this.dataList);
    this._ptItemScanStore.updateOperationTravelerShowBomPanel(this.showBomPanel);
    this._ptItemScanStore.updateOperationTravelerInputBomList(this.inputBomList);
    this._ptItemScanStore.updateOperationTravelerOperationId(this.selectedOperationId);

    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

import { Component, Input, OnInit, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProductionTravelerService } from '../../services/production-traveler.service';
import { IBom } from '@its/shared/interfaces/backend/Bom';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { ISimpleBom } from '@its/shared/interfaces/backend/SimpleBom';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject, takeUntil } from 'rxjs';
import { PtBomScanStoreService } from './pt-bom-scan-store.service';
import { ScanCamerabarcodeService } from '@its/shared/services/scan-camerabarcode.service';

@Component({
  selector: 'app-pt-bom-scan',
  templateUrl: './pt-bom-scan.component.html',
  styleUrls: ['./pt-bom-scan.component.scss'],
  providers: [ProductionTravelerService]
})
export class PtBomScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  DialogCloseEventType = DialogCloseEventType;

  @Input() operationId: number;
  inputBom: IBom[];
  outputBom: ISimpleBom[];

  @Output() bomDialogClosed: EventEmitter<{closeEvent: DialogCloseEventType, outputBom: ISimpleBom[]}> = new EventEmitter();

  constructor(
    private _ptService: ProductionTravelerService,
    private _tagsService: ScannedTagsService,
    private _store: PtBomScanStoreService,
    private _camerabarcodescanService: ScanCamerabarcodeService,
    private ref: ChangeDetectorRef
  ) {
    this.inputBom = this._store.inputBomState;
    this.outputBom = this._store.outputBomState;
  }

  get confirmBtnDisabled(): boolean {
    if (!this.inputBom || !this.outputBom) { return true; }  /* getBomByOperationId processing still underway */
    return this.outputBom.length>0 && this.outputBom.map(bomItem => bomItem.EPCID).includes(""); /* user has yet to scan BOM item EPC */
  }

  ngOnInit(): void {
    this._camerabarcodescanService.onCameraScan$.subscribe({
      next: (isCameraScan) => {
        if (isCameraScan) {
          this._store.updateInputBomState(this.inputBom);
          this._store.updateOutputBomState(this.outputBom);
        }
      }
    });

    if (!!this.operationId) {
      this._ptService.getBomByOperationId(this.operationId).subscribe({
        next: (bom) => {
          this.inputBom = bom;
          this.outputBom = this.inputBom.map(bomItem => { return {"SKU": bomItem.SKU, "Description": bomItem.Description, "EPCID": "" }});
          console.log('[pt-bom-scan] incoming bom', this.inputBom);
          console.log('[pt-bom-scan] outputBom created', this.outputBom);
        }
      });
    }

    this._ptService.incomingProductionTravelerItems$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (scanItems) => {
        console.log('[pt-bom-scan] scan items', scanItems);
        scanItems.forEach(item => {
          const findIdx = this.outputBom.findIndex(entry => entry.SKU === item.SKU);
          if (findIdx >= 0) {
            this.outputBom[findIdx].EPCID = item.EPC_ID;
          }
        });
        console.log('[pt-bom-scan] outputBom updated', this.outputBom);
        this.ref.detectChanges();
        this._tagsService.resetTagsService();
      }
    });
  }

  onClearEpc(index: number) {
    this.outputBom[index].EPCID = "";
  }

  closeBomDialog(closeEvent: DialogCloseEventType) {
    this.bomDialogClosed.emit({closeEvent: closeEvent, outputBom: this.outputBom});
  }

  onClickConfirm() {
    this.closeBomDialog(DialogCloseEventType.Confirm);
  }

  ngOnDestroy(): void {
    this.inputBom = [];
    this.outputBom = [];
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

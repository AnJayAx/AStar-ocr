import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IReceiveVerifyOrderPickedLine } from '@its/shared/interfaces/backend/SPT_Doc/ReceiveVerifyOrder';
import { RvScanService } from '../../services/rv-scan.service';
import { RvVerificationitemsStoreService } from '../../services/rv-verificationitems-store.service';
import { IndicatorColour, IndicatorType } from '@its/shared/components/custom-indicator/custom-indicator.component';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-rv-list-card',
  templateUrl: './rv-list-card.component.html',
  styleUrls: ['./rv-list-card.component.scss']
})
export class RvListCardComponent implements OnInit, OnDestroy {
  IndicatorType = IndicatorType;
  IndicatorColour = IndicatorColour;
  private destroyed$: Subject<boolean> = new Subject();

  @Input() item: IReceiveVerifyOrderPickedLine;

  isM: boolean = false;
  max: number = 0;
  verifiedQty: number = 0;
  isScanning: boolean = false;

  constructor(
    private _rvverifieditemService: RvVerificationitemsStoreService,
    private _rvscanService: RvScanService,
  ) {}

  itemIsPending(): boolean {
    const show = this.isScanning && this.verifiedQty === 0;
    return show;
  }

  mQtyIsDisabled(): boolean {
    return this.itemIsPending() || !this.isScanning;
  }

  ngOnInit(): void {
    this.isM = this.item.SM?.toLowerCase() === 'm';
    this.max = this.item.Qty;
    this._rvverifieditemService.getVerifiedQtyByEpcId(this.item.EPC_ID).pipe(takeUntil(this.destroyed$)).subscribe({
      next: qty => this.verifiedQty = qty
    });
    this._rvscanService.isScanInProgress().pipe(takeUntil(this.destroyed$)).subscribe({
      next: isScanning => this.isScanning = isScanning
    });
  }

  onVerifiedQtyChange(verifiedQty: number) { /* only for M items */
    if (!verifiedQty) { this.verifiedQty = 0; }  /* no empty values allowed */
    else {
      this.verifiedQty = verifiedQty;
    }
    this._rvverifieditemService.setVerifiedQtyByEpcId(this.item.EPC_ID, this.verifiedQty);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

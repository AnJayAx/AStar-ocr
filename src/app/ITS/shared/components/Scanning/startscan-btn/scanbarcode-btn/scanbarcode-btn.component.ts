import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import BarcodePlugin from '@its/shared/interfaces/plugins/BarcodePlugin';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScanCamerabarcodeService } from '@its/shared/services/scan-camerabarcode.service';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

/* only handles barcode reader scanning */
@Component({
  selector: 'app-scanbarcode-btn',
  templateUrl: './scanbarcode-btn.component.html',
  styleUrls: ['./scanbarcode-btn.component.scss'],
})
export class ScanbarcodeBtnComponent implements OnInit, OnDestroy {
  startIcon = faPlay;
  private destroyed$: Subject<boolean> = new Subject();

  private isCameraValid: boolean;
  isScanning: boolean = false;

  constructor(
    private _router: Router,
    private _scanbarcodeService: ScanBarcodeService,
    private _camerabarcodeService: ScanCamerabarcodeService
  ) {
    this._scanbarcodeService.cameraValid$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isValid) => this.isCameraValid = isValid
    });
  }

  ngOnInit(): void {
    console.log('DEBUG scanbarcodebtn connect barcode reader');
    this._scanbarcodeService.connectReader().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => console.log('[B] Response from native:', response)
    });

    this._scanbarcodeService.isScanning$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isScanning) => this.isScanning = isScanning    
    });
  }

  async onStartScan() { 
    if (this.isCameraValid) { 
      this._camerabarcodeService.setOnCameraScan(true);
      this._scanbarcodeService.clearBarcodes();
      this._router.navigate(['scan-page-barcode']); 
    }
    else { 
      console.log('DEBUG resume barcode scanner')
      await BarcodePlugin.resumeScanner();
      this._camerabarcodeService.clearBarcodes();
      this.softScanToggle(); 
    }
  }

  async onStopScan() {
    this._camerabarcodeService.setOnCameraScan(false);
    this.softScanToggle();
    // await BarcodePlugin.suspendScanner();
  }

  private async softScanToggle() {
    await BarcodePlugin.softScanToggle();
  }

  async ngOnDestroy() {
    if (this.isScanning) { await this.onStopScan(); }
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    // await this._scanbarcodeService.disconnect();
  }
}

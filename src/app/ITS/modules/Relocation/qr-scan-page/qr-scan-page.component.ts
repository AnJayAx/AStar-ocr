import { Component, OnDestroy, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { from, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '@its/shared/classes/utils';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { ToastService } from '@dis/services/message/toast.service';

@Component({
  selector: 'app-qr-scan-page',
  templateUrl: './qr-scan-page.component.html',
  styleUrls: ['./qr-scan-page.component.scss']
})
export class QrScanPageComponent implements OnInit, OnDestroy {
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();

  isScanning: boolean = false;
  scannedQR: string;
  showResult: boolean = false;

  backUrl: string;

  constructor(
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
  ) {
    BarcodeScanner.prepare();
    this.backUrl = this.route.snapshot.paramMap.get("backUrl");
  }

  ngOnInit(): void {
    const granted$ = from(Utils.didUserGrantCameraPermission());
    granted$.subscribe({
      next: granted => {
        if (granted) {
          this.startScan();
        } else {
          this.toast.default('Permissions not granted. Returning...');
          setTimeout(() => { this.back(); }, 3000);
        }
      }
    });
  }

  private startScan(): void {
    this.isScanning = true;

    from(BarcodeScanner.hideBackground())
    .pipe(
      takeUntil(this.destroyed$),
      tap(() => document.body.classList.add("scanner")),
      switchMap(() => BarcodeScanner.startScan())
    ).subscribe({
      next: (result) => {
        if (result.hasContent) {
          this.showResult = true;
          this.scannedQR = result.content;
          console.log('[qr-scan-page] scannedQR:', this.scannedQR);
          this.startScan();
        }
      }
    });
  }

  stopScan(): void {
    this.isScanning = false;
    from(BarcodeScanner.showBackground())
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => {
        BarcodeScanner.stopScan();
        document.body.classList.remove("scanner");
        this.back();
      }
    });
  }

  private back() {
    this.router.navigate([`${this.backUrl}`], { state: { 'data': this.scannedQR } });
  }

  ngOnDestroy(): void {
    this.stopScan();
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    console.log('qr-scan-page destroyed');
  }
}

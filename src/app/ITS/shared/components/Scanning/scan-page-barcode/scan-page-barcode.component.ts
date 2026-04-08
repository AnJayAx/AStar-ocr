import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { from, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ScanCamerabarcodeService } from '@its/shared/services/scan-camerabarcode.service';
import { Utils } from '@its/shared/classes/utils';

/* For barcode scanning with camera */
@Component({
  selector: 'app-scan-page-barcode',
  templateUrl: './scan-page-barcode.component.html',
  styleUrls: ['./scan-page-barcode.component.scss'],
})
export class ScanPageBarcodeComponent implements OnInit, OnDestroy {  
  private destroyed$: Subject<boolean> = new Subject();

  isScanning: boolean = false;
  scannedBarcodes: string[] = [];
  lastScannedCode: string = '';
  scannedTags: any;

  constructor(
    private _location: Location,
    private _camerabarcodeService: ScanCamerabarcodeService
  ) {
    BarcodeScanner.prepare();
  }

  ngOnInit() {
    const granted$ = from(Utils.didUserGrantCameraPermission());
    granted$.subscribe({
      next: granted => {
        if (granted) {
          this.startScan();
        }
      }
    });
  }

  private startScan(): void {
    this.isScanning = true;
    this._camerabarcodeService.setIsScanning(true);

    from(BarcodeScanner.hideBackground())
    .pipe(
      takeUntil(this.destroyed$),
      tap(() => document.body.classList.add("scanner")),
      switchMap(() => BarcodeScanner.startScan())
    ).subscribe({
      next: (result) => {
        if (result.hasContent) {
          if (this.isValidURL(result.content)){
            var resultList = result.content.split("/");
            if (resultList.length > 0){
              this.lastScannedCode = resultList[resultList.length-1];
            }
          } else {
            this.lastScannedCode = result.content;
          }

          if (!this.scannedBarcodes.includes(result.content)) { 
            if (this.isValidURL(result.content)){
              var resultList = result.content.split("/");
              if (resultList.length > 0){
                var newContent = resultList[resultList.length-1];
                this.scannedBarcodes.push(newContent);
              }
            } else {
              this.scannedBarcodes.push(result.content);
            } 
          }
          this.startScan();
        }
      }
    });
  }

  
  isValidURL(str) {
    let url;
    
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

  stopScan(): void {
    this._camerabarcodeService.setIsScanning(false);
    
    from(BarcodeScanner.showBackground()).pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => {
        BarcodeScanner.stopScan();
        this.scannedBarcodes = [...new Set(this.scannedBarcodes)];
        if (this.scannedBarcodes.length > 0) {
          this._camerabarcodeService.setScannedBarcodes(this.scannedBarcodes);
        }
        document.body.classList.remove("scanner");
        this.back();
      },
      error: (error) => { console.error(error) }
    });
  }
  
  private back(): void { 
    this._location.back(); 
  }

  ngOnDestroy(): void {
    this.stopScan();
    this.scannedBarcodes = [];
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScanCamerabarcodeService {
  private onCameraScanSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public onCameraScan$: Observable<boolean> = this.onCameraScanSubject.asObservable();

  private isScanningSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isScanning$: Observable<boolean> = this.isScanningSubject.asObservable();

  private scannedBarcodesSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public scannedBarcodes$: Observable<string[]> = this.scannedBarcodesSubject.asObservable();
  
  constructor() {}

  setOnCameraScan(isCameraScan: boolean) {
    this.onCameraScanSubject.next(isCameraScan);
  }

  setIsScanning(isScanning: boolean) {
    this.isScanningSubject.next(isScanning);
  }
  
  setScannedBarcodes(barcodes: string[]): void {
    this.scannedBarcodesSubject.next(barcodes);
  }

  clearBarcodes(): void {
    this.scannedBarcodesSubject.next([]);
  }
}

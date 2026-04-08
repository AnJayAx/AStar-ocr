import { Injectable } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { DWUtilities } from '../../../../../android/app/src/main/java/com/example/app/plugin/dw-utilities';
import { BehaviorSubject, combineLatest, from, map, Observable, of, tap } from 'rxjs';
import BarcodePlugin from '../interfaces/plugins/BarcodePlugin';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ScanmodeEventService } from '@its/shared/services/scan-mode-event.service';
//import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScanBarcodeService {
  public cameraValid$: Observable<boolean>;
  private isScanningSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isScanning$: Observable<boolean> = this.isScanningSubject.asObservable();
  private listenerAdded = false;
  private scannedBarcodesSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public scannedBarcodes$: Observable<string[]> = this.scannedBarcodesSubject.asObservable();

  private scannerStatusListener: PluginListenerHandle;
  private incomingBarcodeListener: PluginListenerHandle;
  constructor(
    private _layoutService: LayoutService,
    private _scanmodeEventService: ScanmodeEventService
  ) {    
    this.cameraValid$ = Capacitor.getPlatform() === 'ios' ?
                          of(true) :
                          from(DWUtilities.isCameraValid())
                            .pipe(map(res => {
                              const valid = res['value'].toLowerCase() === 'true' ? true : false;
                              return valid;
                            }));
  }

  connectReader(): Observable<{ value: string}> {
    console.log("[scan-barcode svc] connectReader");
    return combineLatest({
      helloPlugin: from(BarcodePlugin.echo({ value: 'hello' })),
      isInModule: this._layoutService.isInModule$
    }).pipe(
      tap(values => { 
        this._scanmodeEventService.stopChanging();
        console.log("[scan-barcode svc] connectReader values",JSON.stringify(values,null,2));
        if (values.isInModule) { this.initReader(); }}),
      map(values => values.helloPlugin)
    );
  }
// connectReader(): Observable<{ value: string }> {
//   console.log("[scan-barcode svc] connectReader");

//   return combineLatest({
//     helloPlugin: from(BarcodePlugin.echo({ value: 'hello' })),
//     isInModule: this._layoutService.isInModule$
//   }).pipe(
//     mergeMap(values => {
//       console.log("[scan-barcode svc] connectReader values", JSON.stringify(values, null, 2));

//       // 不在 module 就不初始化 scanner
//       if (!values.isInModule) {
//         this._scanmodeEventService.stopChanging();
//         return of(values.helloPlugin);
//       }

//       // 关键：等待 initReader 完成后再 stopChanging
//       return from(this.initReader()).pipe(
//         tap(() => this._scanmodeEventService.stopChanging()),
//         map(() => values.helloPlugin)
//       );
//     })
//   );
// }


  private noDuplicateBarcodes(barcodes: string): string[] {
    let arr: string[] = [];
    const processed = barcodes.trim().replace('[', '').replace(']','').split(',').filter(data => data.length > 0);
    arr = [...new Set(processed)];
    return arr;
  }
  
  private async initReader() {
    console.log('[scan-barcode.service] [initReader] started');
    await BarcodePlugin.resumeScanner();
    //
    // if (this.listenerAdded) {
    // console.log('[scan-barcode.service] listeners already added, skip addListener');
    // return;
    // }
    // this.listenerAdded = true;
    //
    this.scannerStatusListener = await BarcodePlugin.addListener('scannerStatusChangedEvent', (info: { value: string }) => {
      const scanStarted = info['value'].toLowerCase() === 'true' ? true : false;
      this.isScanningSubject.next(scanStarted);
    });

    this.incomingBarcodeListener = await BarcodePlugin.addListener('incomingBarcodeEvent', (info: { value: string }) => {
      console.log('[scan barcode svc] incoming barcode event', info);
      this.onIncomingBarcodes(info.value);
    });
    console.log('[initReader] Barcode reader resume scanner');
  }
 
  onIncomingBarcodes(barcodeData: string): void {
    const scannedBarcodes = this.noDuplicateBarcodes(barcodeData).map(n => this.functionReturnURLBarcode(n));
    console.log('[scan-barcode svc] scannedBarcodes', scannedBarcodes);
    if (scannedBarcodes.length > 0) {
      this.scannedBarcodesSubject.next(scannedBarcodes);
    }
  }

  functionReturnURLBarcode(n: string){
    if (this.isValidURL(n)){
      const temp = n.split("/");
      console.log("[BARCODE] :",temp);
      return temp[temp.length-1];
    }
    return n;
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

  async disconnect() {
    await BarcodePlugin.suspendScanner();
    console.log('Barcode plugin suspend scanner');

    this.scannerStatusListener?.remove();
    this.incomingBarcodeListener?.remove();

    this.scannerStatusListener = this.incomingBarcodeListener = undefined;
    //
    //this.listenerAdded = false;

    this.isScanningSubject.next(false);
    this.clearBarcodes();    
  }

  clearBarcodes(): void {
    this.scannedBarcodesSubject.next([]);
  }

}

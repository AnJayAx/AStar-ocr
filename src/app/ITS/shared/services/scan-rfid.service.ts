import { Injectable } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import RFIDPlugin from '@its/shared/interfaces/plugins/RFIDPlugin';
import { BehaviorSubject, from, map, Observable, tap, Subject } from 'rxjs';
import { ScanmodeEventService } from '@its/shared/services/scan-mode-event.service';

@Injectable({
  providedIn: 'root'
})
export class ScanRfidService {  
  private isPressed: boolean = false;

  private isScanningSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isScanning$: Observable<boolean> = this.isScanningSubject.asObservable();

  private scannedTags: string[] = []; /* no duplicates */
  private scannedTagsSubject: BehaviorSubject<string[]> = new BehaviorSubject(this.scannedTags);
  public scannedTags$: Observable<string[]> = this.scannedTagsSubject.asObservable();

  triggerPressEventListener: PluginListenerHandle;
  handleTagDataListener: PluginListenerHandle;

  isRfidReaderConnected$: Observable<boolean> = from(RFIDPlugin.connect({ value: 'Hello World!' })).pipe(
    map(res => {return !!res['ok']}),
    tap(ok => console.log('[scan-rfid svc] isRfidReaderConnected$', ok))
  );

//   isRfidReaderConnected(): Observable<boolean> {

//   return from(RFIDPlugin.connect({ value: 'Hello World!' })).pipe(
//     map(res => !!res['ok']),
//     tap(ok => console.log('[scan-rfid svc] isRfidReaderConnected', ok))
//   );
// }

  private rfidLoadEventSource = new Subject<'string'>();
  event$ = this.rfidLoadEventSource.asObservable();

  constructor(private _scanmodeEventService: ScanmodeEventService) {}

  connectReader(): Observable<{value: string}> {
    console.log("[scan-rfid svc] connectReader");
    return from(RFIDPlugin.connect({ value: 'Hello World!'})).pipe(tap(async () => await this.initReader()));
  }

  private async initReader() {
    // to do: send the event 'changing'

    this.triggerPressEventListener = await RFIDPlugin.addListener('triggerPressEvent', (info: any) => {
      if (this.isPressed) {
        this.isScanningSubject.next(true);
      }
      
      if (this.isPressed && !info.isPressed) {  /* previous event is press && current event is non-press => trigger release*/
        if (this.scannedTags.length > 0) {
          this.scannedTags = this.scannedTags.map(x => x.replace(' ', ''));
          this.scannedTags = [...new Set(this.scannedTags)];
        }
        this.onPauseScan();
      }
      this.isPressed = info.isPress;
    });

    this.handleTagDataListener = await RFIDPlugin.addListener('handleTagData', (info: any) => {
      if (info.result) {
        const appendTags = [...info.result.replace('[', '').replace(']', '').split(',')];
        this.scannedTags = [...new Set(this.scannedTags.concat(appendTags))];
        console.log('[scan-rfid svc] handleTagData', this.scannedTags);
      }   
    });

    // pass an event to scan-rfid
    this._scanmodeEventService.stopChanging();
    console.log('[initReader] RFID reader init');
  }

  onPauseScan() {
    this.scannedTagsSubject.next(this.scannedTags);
    this.scannedTags = [];
    this.isScanningSubject.next(false);
  }

  async disconnect() {
    await RFIDPlugin.disconnect();
    this.triggerPressEventListener?.remove();
    this.handleTagDataListener?.remove();
    this.triggerPressEventListener = this.handleTagDataListener = undefined;
    this.isPressed = false;
    this.scannedTags = [];
    this.scannedTagsSubject.next(this.scannedTags);
  }

  clearTags(): void {
    this.scannedTags = [];
    this.scannedTagsSubject.next(this.scannedTags);
  }

  // setTriggerMode(mode: 'RFID' | 'BARCODE'): Observable<any> {
  // return from(RFIDPlugin.setTriggerMode({ mode }));
  // }

  // stopScan(): Observable<any> {
  // return from(RFIDPlugin.stopScan()); 
  // }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { MOCK_EPC_IDS } from '../constants/temp-mock-epcs';
import { ScanBarcodeService } from './scan-barcode.service';
import { ScanCamerabarcodeService } from './scan-camerabarcode.service';
import { ScanRfidService } from './scan-rfid.service';
import { ScanMode, ScanmodeService } from './scanmode.service';
import { ItsSettingsService } from './its-settings.service';

/* Handles tag data from RFID plugin, barcode plugin, camera barcode plugin */
@Injectable({
  providedIn: 'root'
})
export class ScannedTagsService {
  private validTagPrefixes: string[];

  private currTags: string[] = [];
  private scannedTagsSubject: BehaviorSubject<string[]> = new BehaviorSubject(this.currTags);
  public scannedTags$: Observable<string[]> = this.scannedTagsSubject.asObservable();

  private tagsClearedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public tagsCleared$: Observable<boolean> = this.tagsClearedSubject.asObservable();
  
  public isScanning$: Observable<boolean>;
  
  constructor(
    private _scanmodeService: ScanmodeService,
    private _itssettingsService: ItsSettingsService,

    private _scanrfidService: ScanRfidService,
    private _scanbarcodeService: ScanBarcodeService,
    private _scancamerabarcodeService: ScanCamerabarcodeService
  ) {
    this._itssettingsService.validEpcPrefixes$.subscribe({
      next: (prefixes) => {
        console.log('[scanned-tags service] validTagPrefixes', prefixes);
        this.validTagPrefixes = prefixes;
      }
    });
    
    this.isScanning$ = combineLatest({
      rfid: this._scanrfidService.isScanning$,
      barcode: this._scanbarcodeService.isScanning$,
      cameraBarcode: this._scancamerabarcodeService.isScanning$
    }).pipe(map(values => values.rfid || values.barcode || values.cameraBarcode));

    combineLatest({
      mode: this._scanmodeService.scanMode$,
      cameraValid: this._scanbarcodeService.cameraValid$,
    }).pipe(
      switchMap(values => {
        this._scanrfidService.clearTags();
        this._scanbarcodeService.clearBarcodes();
        this._scancamerabarcodeService.clearBarcodes();

        if (values.mode === ScanMode.RFID) {
          console.log('Tag source: _scanrfid');
          return this._scanrfidService.scannedTags$;
        }


        console.log('Tag source: _scanbarcode');
        return this._scanbarcodeService.scannedBarcodes$;
      })
    ).subscribe({
      next: (tags) => { this.addScannedTags(tags); }
    });
  }

  private isValidTag(tag: string) {
    return this.validTagPrefixes.some(prefix => tag.startsWith(prefix));
  }

  private addScannedTags(incomingTags: string[]) {  
    if (incomingTags.length > 0) {  /* empty scans are ignored */

      /* no duplicate tags allowed */
      // const appendtags = [...new Set(incomingTags.map(x => x.replace(" ","")))]; 
      let appendtags = [...new Set(incomingTags.map(x => x.trim()))];  

      const isValidTagPrefixesEnabled = this._itssettingsService.getCurrentEpcPrefixesEnabled();
      if (this.validTagPrefixes.length > 0 && isValidTagPrefixesEnabled) {
        appendtags = appendtags.filter(tag => this.isValidTag(tag)); 
      }
      
      const updatedtags = [...new Set(this.currTags.concat(appendtags))];

      this.updateScannedTags(updatedtags);      
      this.tagsClearedSubject.next(false);
    }
  }

  /* Returns tags that were cleared if needed */
  clearScannedTags(): string[] {
    const clearedtags = this.currTags;
    this.updateScannedTags([]);
    this.tagsClearedSubject.next(true);

    this._scanrfidService.clearTags();
    this._scanbarcodeService.clearBarcodes();
    this._scancamerabarcodeService.clearBarcodes();

    console.log('[scanned-tags service] Tags cleared from scanned-tags service');
    return clearedtags;
  }

  resetTagsService(): void {
    this.updateScannedTags([]);
    this.tagsClearedSubject.next(false);

    this._scanrfidService.clearTags();
    this._scanbarcodeService.clearBarcodes();
    this._scancamerabarcodeService.clearBarcodes();

    console.log('[scanned-tags service] Reset scanned-tags service');
  }

  updateScannedTags(updatedTags: string[]): void {
    this.currTags = updatedTags;
    this.scannedTagsSubject.next(this.currTags);
    console.log('[scanned-tags service] updateScannedTags > scannedTagsSubject', this.scannedTagsSubject.getValue());
  }
  
  // FOR DEVELOPMENT PURPOSES ONLY
  loadMockTags(mocktags: string[] = MOCK_EPC_IDS) {
    const isValidTagPrefixesEnabled = this._itssettingsService.getCurrentEpcPrefixesEnabled();
    if (this.validTagPrefixes.length > 0 && isValidTagPrefixesEnabled) {
      // console.log('TEST unfiltered tags', mocktags);
      mocktags = mocktags.filter(tag => this.isValidTag(tag)); 
      // console.log('TEST only valid tags', mocktags);
    }

    this.updateScannedTags(mocktags);
    this.tagsClearedSubject.next(false);
    console.log('Mock tags loaded');
  }

}

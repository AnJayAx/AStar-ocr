import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import { ScanmodeEventService } from '@its/shared/services/scan-mode-event.service';
import { ScanMode, ScanmodeService } from '@its/shared/services/scanmode.service';
import { Subject, takeUntil, take } from 'rxjs';

@Component({
  selector: 'app-scanmode-buttongroup',
  templateUrl: './scanmode-buttongroup.component.html',
  styleUrls: ['./scanmode-buttongroup.component.scss']
})
export class ScanmodeButtongroupComponent implements OnInit, OnDestroy {
  barcodeIcon = faBarcode;
  private destroyed$: Subject<boolean> = new Subject();
  ScanMode = ScanMode;
  selectedScanMode: ScanMode;
  isChanging = false;
  @Input() isDisabled: boolean = false;
  
  constructor( 
    private _scanmodeService: ScanmodeService,
    private _scanmodeEventService: ScanmodeEventService
  ) {}
  
  ngOnInit(): void {
    this._scanmodeService.scanMode$.pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (res) => { 
        this.selectedScanMode = res; 
      },
      error: (err) => { console.error(err); }
    });

     // first time init scan mode change
    this._scanmodeService.scanMode$
    .pipe(take(1))
    .subscribe((mode) => {
      if (mode === ScanMode.RFID) {
        this._scanmodeEventService.startChanging();
      }
    });

    this._scanmodeEventService.isChanging$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(changing =>{
        console.log('this._scanmodeService.isChanging$ | changing', changing); 
        return this.isChanging = changing});
  }

  onScanModeChange(selectedMode: ScanMode) {
    if(this.selectedScanMode === selectedMode) { return; }
    this._scanmodeEventService.startChanging();
    // to do: set changing to be false
    this.selectedScanMode = selectedMode;
    this._scanmodeService.setSelectedScanMode(this.selectedScanMode);
  }

  isButtonHighlighted(type: ScanMode.RFID | ScanMode.Barcode): boolean {
    return this.selectedScanMode?.toString() === type.toString();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}


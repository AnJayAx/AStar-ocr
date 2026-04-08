import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import RFIDPlugin from '@its/shared/interfaces/plugins/RFIDPlugin';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';
import { from, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-scanrfid-btn',
  templateUrl: './scanrfid-btn.component.html',
  styleUrls: ['./scanrfid-btn.component.scss'],
})
export class ScanrfidBtnComponent implements OnInit, OnDestroy {
  startIcon = faPlay;
  private destroyed$: Subject<boolean> = new Subject();

  isScanning: boolean = false;
  @Output() scanToggled: EventEmitter<boolean> = new EventEmitter(this.isScanning);

  constructor( private _rfidscanService: ScanRfidService ) {}

  ngOnInit(): void {
    this._rfidscanService.connectReader().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => console.log('[R] Response from native:', response)
    });
    this._rfidscanService.isScanning$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isScanning) => this.isScanning = isScanning
    });
  }

  startScan(): void {
    from(RFIDPlugin.performScan({ value: 'perform scan' })).pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => {
        this.isScanning = true;
        this.scanToggled.emit(this.isScanning);
      },
      error: (error) => { console.error(error); }
    });
  }

  stopScan(): void {
    from(RFIDPlugin.stopScan({ value: 'stop scan'})).pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => {
        this._rfidscanService.onPauseScan();
        this.isScanning = false;
        this.scanToggled.emit(this.isScanning);
      },
      error: (error) => { console.error(error); }
    });
  }

  ngOnDestroy() {
    if (this.isScanning) {this.stopScan(); }
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    this._rfidscanService.disconnect();
  }

}

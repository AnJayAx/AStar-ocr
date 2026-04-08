import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ScanMode, ScanmodeService } from '@its/shared/services/scanmode.service';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';

@Component({
  selector: 'app-startscan-btn',
  templateUrl: './startscan-btn.component.html',
  styleUrls: ['./startscan-btn.component.scss'],
})
export class StartscanBtnComponent implements OnInit, OnDestroy {
  ScanMode = ScanMode;
  private destroyed$: Subject<boolean> = new Subject();

  scanmode: string;

  constructor(
    private _scanmodeService: ScanmodeService,
  ) {}

  ngOnInit(): void {
    this._scanmodeService.scanMode$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (mode) => this.scanmode = mode,
      error: (error) => { console.error(error); }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

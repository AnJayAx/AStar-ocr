import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { LocationBarService } from '@its/modules/Locating/location-bar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-location-bar',
  templateUrl: './location-bar.component.html',
  styleUrls: ['./location-bar.component.scss'],
  providers: [LocationBarService]
})
export class LocationBarComponent implements OnInit, OnChanges, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  @Input() locationingID: string;
  distance: number = 0; /* percentage 0 - 100 */
  locationStatus: string;
  isScanning: boolean = false;

  getTranslateY() { return 100 - this.distance; }
  
  constructor(
    private ref: ChangeDetectorRef,
    private _locationbarService: LocationBarService
  ) {
    this._locationbarService.connect();
    // this._locationbarService.connect().pipe(takeUntil(this.destroyed$)).subscribe({
    //   next: (connected) => {
    //     if (connected && !!this.locationingID) {
    //       this._locationbarService.setLocationingID(this.locationingID);
    //     }
    //   }
    // });
  }

  ngOnInit() {
    if (!!this.locationingID) {
      this._locationbarService.setLocationingID(this.locationingID);
    }

    this._locationbarService.isScanning$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (isScanning) => { 
        console.log('isScanning from _locationbarservice', isScanning);
        this.isScanning = isScanning; 
        this.ref.detectChanges();
      }
    });

    this._locationbarService.distance$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (distance) => { 
        console.log('Distance from _locationbarsevice', distance);
        this.distance = distance; 
        this.ref.detectChanges();
      }
    });
  }

  ngOnChanges() {
    if (!!this.locationingID) {
      this._locationbarService.setLocationingID(this.locationingID);
    }
  }
  

  startLocationScan() {
    this._locationbarService.startLocationScan();
  }

  stopLocationScan() {
    this._locationbarService.stopLocationScan();
  }

  ngOnDestroy(): void {
    this._locationbarService.disconnect();
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }  

  // BELOW ARE FOR DEVELOPMENT PURPOSES ONLY //
  testVals = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ];

  onSelectTestVal(val) {
    this.distance = val;
    this.ref.detectChanges();
  }

  isButtonHighlighted(val) {
    return this.distance == val;
  }

}

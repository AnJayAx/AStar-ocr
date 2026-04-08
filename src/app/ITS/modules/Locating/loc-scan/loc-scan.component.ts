import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LocationBarService } from '../location-bar.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-loc-scan',
  templateUrl: './loc-scan.component.html',
  styleUrls: ['./loc-scan.component.scss'],
  providers: [LocationBarService]
})
export class LocScanComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  locateEPC: string = 'EPC123';

  constructor(
    private route: ActivatedRoute,
    private _locationbarService: LocationBarService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Locating', 'mainmenunew');
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (params) => {
        this.locateEPC = params.get('epcID');
      }
    });
  }

  ngOnDestroy(): void {
    this._locationbarService.removeLocationingID();
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

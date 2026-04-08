import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { StSettingsService } from '../services/st-settings.service';
import { STStatus, FILTER_PAGE_MAPPING } from '../stocktaking.constants';
import { StScanMenurouterService } from './st-scan-menurouter.service';

@Component({
  selector: 'app-st-scan-menurouter',
  templateUrl: './st-scan-menurouter.component.html',
  styleUrls: ['./st-scan-menurouter.component.scss']
})
export class StScanMenurouterComponent implements OnInit, OnDestroy {
  STStatus = STStatus;
  private destroyed$: Subject<boolean> = new Subject();
  
  filterRouteMap = FILTER_PAGE_MAPPING;
  selectedId: STStatus;

  constructor(
    private _menurouterService: StScanMenurouterService,
    private _stsettingsService: StSettingsService,
    private ref: ChangeDetectorRef,
    private ngZone: NgZone,

  ) {
    if (!this._stsettingsService.getLoadFoundItems()) {
      this.filterRouteMap = this.filterRouteMap.filter(x => x.filter !== STStatus.Submitted);
    }
  }
  
  ngOnInit(): void {
    this._menurouterService.selectedFilter$.subscribe({
      next: (newSelection) => { 
        this.selectedId = newSelection;
        this.ref.detectChanges();
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.scrollMenuItemIntoView();
  }

  onClick(selected: STStatus) {
    this._menurouterService.setSelectedFilter(selected);
    this._menurouterService.setLoadSubmittedList(selected === STStatus.Submitted);

    this.ngZone.run(() => {
      this.scrollMenuItemIntoView();
    }); 
  }

  private scrollMenuItemIntoView() {
    const element = document.getElementById(this.selectedId.toString());
    element.scrollIntoView({block: "nearest",
    inline: "center",
    behavior: "smooth"});
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

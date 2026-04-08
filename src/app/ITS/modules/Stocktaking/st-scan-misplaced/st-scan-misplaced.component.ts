import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { Subject, takeUntil } from 'rxjs';
import { StSettingsService } from '../services/st-settings.service';
import { STStatus } from '../stocktaking.constants';
import { MisplacedStlistService } from './misplaced-stlist.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { faCartFlatbed } from '@fortawesome/free-solid-svg-icons';
import { StFiltersStoreService } from '../services/st-filters-store.service';

@Component({
  selector: 'app-st-scan-misplaced',
  templateUrl: './st-scan-misplaced.component.html',
  styleUrls: ['./st-scan-misplaced.component.scss'],
  providers: [MisplacedStlistService]
})
export class StScanMisplacedComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  filterBy: STStatus = STStatus.Misplaced;
  relocateIcon = faCartFlatbed;

  selectedLocs: string[] = [];
  updateItemsLoc: boolean;
  disableUpdateItemsLoc: boolean = true;

  listItems: ISTItem[] = [];

  constructor(
    private _stsettingsService: StSettingsService,
    private _misplacedlistService: MisplacedStlistService,
    private _layoutService: LayoutService,
    private _stfiltersService: StFiltersStoreService,
  ) {
    this.filterBy = STStatus.Misplaced;

    this.selectedLocs = this._stfiltersService.selectedLocations;
    this.updateItemsLoc = this._stsettingsService.getUpdateItemsLoc();

    if (this.selectedLocs.length == 1) { this.disableUpdateItemsLoc = false; }
    else { 
      this.disableUpdateItemsLoc = true;
      this.updateItemsLoc = false;
      this._stsettingsService.setDefaultUpdateItemsLoc();
    }

    this._layoutService.changeTitleDisplayAndSetNavBackPath('Misplaced', 'st-scan');
  }

  showRequestCheckbox(): boolean {
    return this.listItems.length > 0 && this.selectedLocs.length > 0;
  }

  ngOnInit(): void { 
    this._misplacedlistService.getMisplacedList().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (items) => { this.listItems = items; },
      error: (error) => { console.error(`st-scan-misplaced error: ${error}`); }
    });
    
  }

  onClickUpdateItemsLoc() { 
    this.updateItemsLoc = !this.updateItemsLoc;
    this._stsettingsService.setUpdateItemsLoc(this.updateItemsLoc);
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

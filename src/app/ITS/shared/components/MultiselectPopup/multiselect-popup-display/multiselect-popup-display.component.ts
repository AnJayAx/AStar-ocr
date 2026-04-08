import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { PopupSelectionService } from '@its/shared/services/popup-selection.service';

enum ViewTypes {
  NoDataNoSelections = 1, 
  DataNoSelections = 2,
  DataAllSelections = 3,  
  DataSomeSelections = 4, 
}

@Component({
  selector: 'app-multiselect-popup-display',
  templateUrl: './multiselect-popup-display.component.html',
  styleUrls: ['./multiselect-popup-display.component.scss']
})
export class MultiselectPopupDisplayComponent implements OnInit {
  ViewTypes = ViewTypes;
  currentView: ViewTypes;

  @Input() fieldName: string;
  @Input() required: boolean = false;
  @Input() storageKey: string;
  @Input() options: DataItem[] = [];
  
  selectionsList: { value: string; label: string }[];
  noDataMsg: string = 'No data available.';
  noSelectionsMsg: string = 'No selections made.';

  storedSelectionsData: string;

  constructor( 
    private _router: Router,
    private _selectionService: PopupSelectionService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (!!this.options) {
      this.setSelectionsList();
      this.setViewType();
    }
  }

  private setSelectionsList(): void {
    this.selectionsList = this._selectionService.getSelections(this.storageKey);
  }

  private setViewType(): void {
    /* check no data available */
    if (this.hasNoData()) { 
      this.currentView = ViewTypes.NoDataNoSelections; 
      return;
    }

    /* data available --> check no selected options */
    if (this.options.length>0 && this.hasNoSelections()) { 
      this.currentView = ViewTypes.DataNoSelections;
      return;
    }

    /* data available, all options selected */
    if (this.options.length>0 && this.hasAllSelections()) { 
      this.currentView = ViewTypes.DataAllSelections; 
      return;
    }

    /* data available, some options selected */
    if (this.options.length>0 && this.selectionsList.length>0) {
      this.currentView =  ViewTypes.DataSomeSelections;
    }
  }

  private hasNoData(): boolean {
    return !this.options || this.options.length <= 0;
  }
  private hasNoSelections(): boolean {
    return !this.selectionsList || this.selectionsList.length <= 0;
  }
  private hasAllSelections(): boolean { 
    return !!this.selectionsList && this.selectionsList.length > 0 
      && !!this.options && this.options.length > 0
      && this.selectionsList.length >= this.options.length;
  }

  onClickDisplayList() {
    if (this.hasNoData()) { return; }
    const stringifiedData: string = JSON.stringify(this.options);
    this._router.navigate(['multiselect-popup-selection'], { queryParams: { fieldName: this.fieldName, options: stringifiedData, selectionStorageKey: this.storageKey } });
  }

}

import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from "@angular/common";

import { StorageService } from '@dis/services/storage/storage.service';

import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { PopupSelectionService } from '@its/shared/services/popup-selection.service';
import { LayoutService } from '@dis/services/layout/layout.service';

export interface MultiSelectItem {
  text: string;
  value: unknown;
}

const SELECT_TEXT = 'Select All';
const UNSELECT_TEXT = 'Unselect All';

@Component({
  selector: 'app-multiselect-popup-selection',
  templateUrl: './multiselect-popup-selection.component.html',
  styleUrls: ['./multiselect-popup-selection.component.scss']
})
export class MultiselectPopupSelectionComponent implements OnInit, OnChanges {
  fieldName: string;
  storageKey: string;
  
  listItems: DataItem[];
  viewListItems: DataItem[];
  selectedItems: DataItem[];
  headerText: string;
  searchTerm: string;

  listItemLength: number;

  constructor( 
    private _location: Location,
    private _storageService: StorageService,
    private _route: ActivatedRoute,
    private _popupselectionService: PopupSelectionService,
    private _layoutService: LayoutService,
  ) { 

    this._route.queryParamMap.subscribe({
      next: (params) => {
        const fieldNameData = params.get('fieldName');
        const optionsData = params.get('options');
        const storageKeyData = params.get('selectionStorageKey');

        if (!fieldNameData || !optionsData || !storageKeyData) { throw new Error('Missing parameters from navigation logic'); }
        
        this.fieldName = fieldNameData;
        this.searchTerm = `Search ${this.fieldName}...`;

        this.listItems = JSON.parse(optionsData);
        this.viewListItems = [...this.listItems];
        this.storageKey = storageKeyData;

        this.selectedItems = this._popupselectionService.getSelections(this.storageKey);

        this._layoutService.changeTitleDisplayAndSetNavBackPath(this.fieldName, 'st-details');
      }, 
      error: (err) => { console.error(err); }
    });    
  }

  ngOnInit(): void {
    this.init();
  }
  
  ngOnChanges(): void {
    if (!!this.selectedItems && !!this.listItems) {
      this.init();
    }
  }

  private init() {
    this.loadHeaderText();
    this.listItemLength = this.listItems.length;
  }

  private loadHeaderText(): void {
    if (!!this.selectedItems && this.selectedItems.length != 0) { this.headerText = UNSELECT_TEXT; }
    else { this.headerText = SELECT_TEXT; }
  }

  onHeaderClick() {
    if (this.selectedItems.length != 0) { this.selectedItems = []; }
    else { this.selectedItems = [...this.listItems]; } 
    this.loadHeaderText();
    
    if (this.selectedItems.length > 0) { this._storageService.setItem(this.storageKey, JSON.stringify(this.selectedItems)); }
    else { this._storageService.setEmptyItem(this.storageKey); }
  }

  toggleSelectedItemChange(dataItem: DataItem): void {
    const findIdx = this.selectedItems.findIndex(item => item.value === dataItem.value);
    if (findIdx >= 0) {
      this.selectedItems = this.selectedItems.filter(items => items.value !== dataItem.value);
    } else {
      this.selectedItems.push(dataItem);
    }

    this.loadHeaderText();
    if (this.selectedItems.length > 0) { this._storageService.setItem(this.storageKey, JSON.stringify(this.selectedItems)); }
    else { this._storageService.setEmptyItem(this.storageKey); }    
  }

  isSelectedItem(dataValue: number|string): boolean {
    const item = this.selectedItems.find(item => item.value === dataValue);
    if (!!item) { return true }
    else { return false };
  }

  onViewItemsChanged(updatedViewItems: DataItem[]) { this.viewListItems = updatedViewItems; }

  onConfirm() { this._location.back(); }

}

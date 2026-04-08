import { Injectable } from '@angular/core';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { IItemInfo } from '../interfaces/backend/ItemInfo';


// service passing data through different internal components
@Injectable({
  providedIn: 'root'
})
export class InternalItsServiceService {

  private selectedTags:ISelectedTag[];
  private selectedScanItems: IItemInfo[];

  constructor() { }

  replaceSelectedTags(selectedTags:ISelectedTag[]) { this.selectedTags = selectedTags; }
  replaceSelectedScanItems(selectedItems: IItemInfo[]) { this.selectedScanItems = selectedItems; }

  retrieveSelectedTags() { return this.selectedTags; }
  retrieveSelectedScanItems() { return this.selectedScanItems; }
}

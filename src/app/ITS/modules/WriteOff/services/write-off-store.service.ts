import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Injectable({
  providedIn: 'root'
})
export class WriteOffStoreService {

  private selectedOrderNoState: string = '';
  private searchInputState: string = '';
  private writeOffListState: IItemInfo[];
  private viewWriteOffListState: IItemInfo[];
  private confirmedWriteOffListState: IItemInfo[];

  constructor() { }

  setStates(states: {selectedOrderNo: string, searchInput: string, writeOffList: IItemInfo[], viewWriteOffList: IItemInfo[], confirmedWriteOffList: IItemInfo[]}): void {
    this.selectedOrderNoState = states.selectedOrderNo;
    this.searchInputState = states.searchInput;
    this.writeOffListState = states.writeOffList;
    this.viewWriteOffListState = states.viewWriteOffList;
    this.confirmedWriteOffListState = states.confirmedWriteOffList;
  }

  resetStates(): void {
    this.setStates({
      selectedOrderNo: '',
      searchInput: '',
      writeOffList: [],
      viewWriteOffList: [],
      confirmedWriteOffList: [],
    });
  }

  getSelectedOrderNoState() { return this.selectedOrderNoState; }
  getSearchInputState() { return this.searchInputState; }
  getWriteOffListState() { return this.writeOffListState; }
  getViewWriteOffListState() { return this.viewWriteOffListState; }
  getConfirmedWriteOffListState() { return this.confirmedWriteOffListState; }
}

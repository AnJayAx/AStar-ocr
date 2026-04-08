import { Injectable } from '@angular/core';
import { IPLListItem } from '@its/shared/interfaces/frontend/PLListItem';
import { IPLTagItem } from '@its/shared/interfaces/frontend/PLTagItem';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlSelectedTaglistService {

  private selectedTagListSubject: BehaviorSubject<IPLTagItem[]> = new BehaviorSubject([]);
  public selectedTagList$: Observable<IPLTagItem[]> = this.selectedTagListSubject.asObservable();

  updateSelectedTagList(updatedList: IPLTagItem[]): void { this.selectedTagListSubject.next(updatedList); }

  setSelectedTagList(selectedListItem: IPLListItem) { this.selectedTagListSubject.next(selectedListItem.TagItems); }

  getSelectedTagList(): Observable<IPLTagItem[]> { return this.selectedTagListSubject.asObservable(); }

  reset() { this.selectedTagListSubject.next([]); }

  constructor() {}
}


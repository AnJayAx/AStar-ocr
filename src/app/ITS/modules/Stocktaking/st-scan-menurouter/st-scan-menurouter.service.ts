import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STStatus } from '../stocktaking.constants';

@Injectable({
  providedIn: 'root'
})
export class StScanMenurouterService {

  private selectedFilterSubject: BehaviorSubject<STStatus> = new BehaviorSubject(STStatus.Pending);
  public selectedFilter$: Observable<STStatus> = this.selectedFilterSubject.asObservable();

  private loadSubmittedListSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadSubmittedList$: Observable<boolean> = this.loadSubmittedListSubject.asObservable();

  constructor() {}

  setSelectedFilter(filter: STStatus) {
    this.selectedFilterSubject.next(filter);
  }

  setLoadSubmittedList(load: boolean) {
    this.loadSubmittedListSubject.next(load);
  }
}

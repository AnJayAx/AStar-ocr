import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RvTagListService {

  private pendingList: any[] = [];
  private foundList: any[] = [];
  private excessList: any[] = [];

  private pendingListSubject: BehaviorSubject<any[]> = new BehaviorSubject(this.pendingList);
  private foundListSubject: BehaviorSubject<any[]> = new BehaviorSubject(this.foundList);
  private excessListSubject: BehaviorSubject<any[]> = new BehaviorSubject(this.excessList);

  public pendingList$: Observable<any[]> = this.pendingListSubject.asObservable();
  public foundList$: Observable<any[]> = this.foundListSubject.asObservable();
  public excessList$: Observable<any[]> = this.excessListSubject.asObservable();

  constructor() { }

  updatePendingList(updatedPendingList: any[]) {
    this.pendingList = updatedPendingList;
    this.pendingListSubject.next(this.pendingList);
  }

  updateFoundList(updatedFoundList: any[]) {
    this.foundList = updatedFoundList;
    this.foundListSubject.next(this.foundList);
  }

  updateExcessList(updatedExcessList: any[]) {
    this.excessList = updatedExcessList;
    this.excessListSubject.next(this.excessList);
  }

  clearAllLists() {
    this.pendingList = this.foundList = this.excessList = [];
    this.pendingListSubject.next([]);
    this.foundListSubject.next([]);
    this.excessListSubject.next([]);
  }
}

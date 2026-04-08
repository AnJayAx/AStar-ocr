import { Injectable, Optional } from '@angular/core';
import { Observable, BehaviorSubject, Subject, takeUntil } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ScanmodeEventService {
  private isChangingSubject = new BehaviorSubject<boolean>(false);
  isChanging$: Observable<boolean> = this.isChangingSubject.asObservable();

  constructor() {}

  startChanging() {
    console.log('scanmodeSvc | startChanging');
    this.isChangingSubject.next(true);
  }
  stopChanging() {
    console.log('scanmodeSvc | stopChanging');
    this.isChangingSubject.next(false);
  }

}

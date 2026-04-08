import { Injectable } from '@angular/core';
import { InitPageEventType } from '@its/shared/constants/constants';
import { BehaviorSubject, filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitPageEventQueueService {

  private eventBrokerSubject: BehaviorSubject<InitPageEventType> = new BehaviorSubject(null);

  public loginDoneCallback = undefined;

  constructor() {}

  on(eventType: InitPageEventType): Observable<InitPageEventType> {
    return this.eventBrokerSubject.pipe(filter(event => !!event && event === eventType));
  }

  dispatch(event: InitPageEventType): void {
    console.log('DISPATCH', event);
    this.eventBrokerSubject.next(event);
  }

  clearLoginDoneCallback(): void {
    clearInterval(this.loginDoneCallback);
    this.loginDoneCallback = null;
  }
}

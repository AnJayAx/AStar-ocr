import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsSplitStoreService {

  private isSerialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSerializedState$: Observable<boolean> = this.isSerialized$.asObservable();

  private serializedTags$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  serializedTagsState$: Observable<string[]> = this.serializedTags$.asObservable();

  private nonSerializedTag$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  nonSerializedTagState$: Observable<string> = this.nonSerializedTag$.asObservable();

  private nonSerializedCheckoutQty$: BehaviorSubject<number> = new BehaviorSubject(undefined);
  nonSerializedCheckoutQtyState$: Observable<number> = this.nonSerializedCheckoutQty$.asObservable();

  constructor() { }

  setIsSerializedState(isSerialized: boolean): void {
    this.isSerialized$.next(isSerialized);
  }

  setSerializedTagsState(serializedTags: string[]): void {
    this.serializedTags$.next(serializedTags);
  }

  setNonSerializedTagState(nonSerializedTag: string): void {
    this.nonSerializedTag$.next(nonSerializedTag);
  }

  setNonSerializedCheckoutQty(nonSerializedCheckoutQty: number): void {
    this.nonSerializedCheckoutQty$.next(nonSerializedCheckoutQty);
  }

  resetIsSplitStoreService(): void {
    this.isSerialized$.next(false);
    this.serializedTags$.next([]);
    this.nonSerializedTag$.next(undefined);
    this.setNonSerializedCheckoutQty(undefined);
  }

}

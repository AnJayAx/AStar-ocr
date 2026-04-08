import { Injectable } from '@angular/core';
import { IPickedItem } from '@its/shared/interfaces/backend/SPT_Doc/PickedItem';
import { BehaviorSubject, filter, map, Observable, tap } from 'rxjs';
import { RvPickeditemsService } from './rv-pickeditems.service';

export interface VItemTrackerValue {
  verifiedQty: number;
  pickedQty: number;
  isM: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RvVerificationitemsStoreService {

  private verificationItemTrackerSubject: BehaviorSubject<Map<string, VItemTrackerValue>> = new BehaviorSubject(new Map());
  public verificationItemTracker$: Observable<Map<string, VItemTrackerValue>> = this.verificationItemTrackerSubject.asObservable();

  constructor(
    private _rvpickeditemsService: RvPickeditemsService
  ) {
      this.loadDefaultVerificationItemTracker();
  }

  private loadDefaultVerificationItemTracker(): void {
    this._rvpickeditemsService.selectedPickedItems$.subscribe({
      next: pickedItems => this.setVerificationItemTrackerFromPickedItems(pickedItems)
    });
  }

  isVerificationItemTrackerInitialized(): boolean {
    return this.verificationItemTrackerSubject.getValue().size === 0;
  }
  
  setVerificationItemTrackerFromPickedItems(pickedItems: IPickedItem[]): void {
    const tracker = this.getVerificationItemTrackerFromPickedItems(pickedItems);
    this.verificationItemTrackerSubject.next(tracker);
  }

  resetVerificationItemTracker(): void {
    this.verificationItemTrackerSubject.next(new Map());
  }

  private getVerificationItemTrackerFromPickedItems(pickedItems: IPickedItem[]): Map<string, VItemTrackerValue> {
    const newTracker: Map<string, VItemTrackerValue> = new Map();
    pickedItems.forEach(pickedItem => {
      newTracker.set(pickedItem.EPC_ID, { verifiedQty: 0, isM: pickedItem.SM?.toLowerCase() === 'm', pickedQty: pickedItem.Qty });
    });
    return newTracker;
  }

  getVerifiedQtyByEpcId(epcID: string): Observable<number> {
    return this.verificationItemTrackerSubject.pipe(
      filter(tracker => tracker.has(epcID)),
      map(tracker => tracker.get(epcID).verifiedQty),
      tap(qty => console.log(`${epcID} verified qty: ${qty}`))
    );
  }

  setVerifiedQtyByEpcId(epcID: string, verifiedQty: number): void {
    const currentTracker = this.verificationItemTrackerSubject.getValue();
    const entryValue = currentTracker.get(epcID);
    entryValue.verifiedQty = verifiedQty;
    currentTracker.set(epcID, entryValue);
    this.verificationItemTrackerSubject.next(currentTracker);
  }

  updateVerificationItemTrackerOnScan(incomingTags: string[]): void {
    const currentTracker = this.verificationItemTrackerSubject.getValue();
    console.log('onScan current tracker', currentTracker);
    incomingTags.forEach(tag => {
      if (currentTracker.has(tag)) {
        const entryValue = currentTracker.get(tag);
        entryValue.verifiedQty = entryValue.isM ? entryValue.pickedQty : 1; /* if M item tag is detected, assume that M item has all pickedQty. User may still edit this value */
        currentTracker.set(tag, entryValue);
      } else {
        console.log('Skipping invalid tag...', tag);
      }
    });
    this.verificationItemTrackerSubject.next(currentTracker);
  }

  clearVerificationItemTracker(): void {
    this.verificationItemTrackerSubject.next(new Map());
  }
}

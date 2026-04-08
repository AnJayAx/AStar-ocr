import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  private _subject = new Subject(); // For subscription

  watch(): Observable<any> {
    return this._subject.asObservable(); // Return Observable for async sequential responses
  }

  setItem(key: string, data: string|JSON): boolean {
    const saveData = (typeof data == 'string') ? data : JSON.stringify(data);
    localStorage.setItem(key, saveData);
    this._subject.next(data); // Broadcast next-ed data to all subscribers
    return true;
  }

  getItem(key: string) {
    return localStorage.getItem(key);
  }

  /* ITS: Extended utilities */

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  setEmptyItem(key: string): boolean {
    const EMPTY = 'EMPTY';
    localStorage.setItem(key, EMPTY);
    this._subject.next(EMPTY);
    return true;
  }

  isItemUndefined(data: string): boolean {
    return !data || data === null || data === undefined || data === 'null' || data === 'undefined';
  }

  isItemEmpty(data: string): boolean {
    return !!data && (data === 'EMPTY' || data === "");
  }

  itemIsUndefinedOrEmpty(data: string): boolean {
    return this.isItemEmpty(data) || this.isItemUndefined(data);
  }

  itemIsDefined(data: string): boolean {
    return !!data && data != null && data != '' && data != 'null';
  }

  getStoredBoolean(data: string): boolean {
    return data.toLowerCase() === 'true' ? true : false;
  }

}

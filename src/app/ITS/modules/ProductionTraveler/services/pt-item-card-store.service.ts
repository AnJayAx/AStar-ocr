import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PtItemCardStoreService {
  private initialLastBalStateDict = new Map();

  constructor() { }

  setInitialLastBal(key: string, initialLastBal: number) { 
    if (!this.initialLastBalStateDict.get(key)) {
      this.initialLastBalStateDict.set(key, initialLastBal);
    } else {
      console.log(`initialLastBalState is already defined for ${key}`, this.initialLastBalStateDict.get(key));
    }
  }

  getInitialLastBal(key: string) { return this.initialLastBalStateDict.get(key); }
  clearInitialLastBal(key: string) { this.initialLastBalStateDict.delete(key); }

  resetStore(): void { this.initialLastBalStateDict = new Map(); }
}

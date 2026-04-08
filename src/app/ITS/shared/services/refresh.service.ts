import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private count = 0;
  // private readonly autoRefresh$ = interval(30000).pipe(startWith(0));
  readonly refreshToken$: BehaviorSubject<number> = new BehaviorSubject(this.count);

  constructor() { }

  refresh() {
    this.refreshToken$.next(this.count);
    this.count+=1;
    console.log('[refreshToken$]', this.refreshToken$.getValue());
  }
}

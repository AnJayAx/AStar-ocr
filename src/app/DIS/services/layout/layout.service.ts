import { Injectable } from '@angular/core';
import { YOUR_APP_NAME } from '@dis/settings/behavior.config';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  DEFAULT_TITLE = YOUR_APP_NAME;
  LANDING_PAGE_PATH = '/mainmenunew';

  titleDisplay$: BehaviorSubject<string> = new BehaviorSubject(this.DEFAULT_TITLE);
  navBackPath$: Subject<string> = new Subject();
  navBackClicked$: Subject<boolean> = new Subject();
  isInModule$: Observable<boolean> = this.titleDisplay$.pipe(map(pageName => pageName != YOUR_APP_NAME));

  constructor() { }

  changeTitleDisplay(title: string) {
    this.titleDisplay$.next(title);
  }

  changeTitleDisplayAndSetNavBackPath(title: string, path: string) {
    this.titleDisplay$.next(title);
    this.navBackPath$.next(path);
  }

  setNavBackPath(path: string) {
    this.navBackPath$.next(path);
  }

  setDefaultNavPath() {
    this.navBackPath$.next(null);
  }

  setDefaultTitleDisplay() {
    this.titleDisplay$.next(this.DEFAULT_TITLE);
  }

  onNavBack() {
    this.navBackClicked$.next(true);
  }
}

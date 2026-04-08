import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable} from "rxjs";
import {APP_OPTIONS} from "@dis/settings/behavior.config";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  readonly LANGUAGE_KEY: string = 'LANGUAGE';
  languageChangeEvent = new BehaviorSubject<string>('');
  languageChangeCompletedEvent = new BehaviorSubject<string>('');

  constructor(private translate: TranslateService) { }

  emitLanguageChangeEvent(msg: any): void {
    this.languageChangeEvent.next(msg);
  }

  getLanguageChangeListener(): Observable<any>{
    return this.languageChangeEvent.asObservable();
  }

  enmitLanguageChangeCompletedEvent(item: any): void {
    this.languageChangeCompletedEvent.next(item);
  }

  getLanguageChangeCompletedEvent(): Observable<any>{
    return this.languageChangeCompletedEvent.asObservable();
  }


  getAllSupportedLanguage(): any[] {
    return APP_OPTIONS.i18n.supported;
  }

  setLanguageInSessionStorage(value): void {
    if (value){
      sessionStorage.setItem(this.LANGUAGE_KEY, JSON.stringify(value));
    }
  }

  getLanguageInSessionStorage(): any {
    const item = sessionStorage.getItem(this.LANGUAGE_KEY);
    return item ? JSON.parse(item) : undefined;
  }
}

import { Injectable } from '@angular/core';
import {MessageService} from '@progress/kendo-angular-l10n';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CustomMessageService extends  MessageService{

  // constructor(@Injectable() private translateService: TranslateService) {
  //   super();
  // }
  constructor(private translateService: TranslateService) {
    super();
  }
  get(key: string): string {
    const value = this.translateService.instant(key);
    console.log(key);
    return value;
  }
}

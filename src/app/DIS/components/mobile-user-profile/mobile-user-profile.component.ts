import {Component, OnInit, Output, Input, EventEmitter, Inject, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {APP_OPTIONS} from '@dis/settings/behavior.config';
import {TranslateService} from '@ngx-translate/core';
import {TranslationService} from '@dis/services/message/translation.service';

@Component({
  selector: 'app-mobile-user-profile',
  templateUrl: './mobile-user-profile.component.html',
  styleUrls: ['./mobile-user-profile.component.scss']
})
export class MobileUserProfileComponent implements OnInit {

  @Output() newLanguageEvent = new EventEmitter<string>();
  isDarkMode: boolean;
  classNameDarkMode: string;
  languages: any[];
  languageSelected: any;

  constructor(@Inject(DOCUMENT) private document: Document,
              private renderer: Renderer2,
              private translate: TranslateService,
              private translation: TranslationService) { }

  ngOnInit(): void {

    this.classNameDarkMode  = APP_OPTIONS.darkmode.className;
    if (this.document.body.classList.contains( this.classNameDarkMode)) {
      this.isDarkMode = true;
    }


    this.languages = this.translation.getAllSupportedLanguage();
    let sessionLanguage = this.translation.getLanguageInSessionStorage();
    console.log(sessionLanguage);
    if(sessionLanguage){
      this.languageSelected = sessionLanguage;
      this.translate.use(sessionLanguage.value);
    }else {

      this.languageSelected = this.languages.find(item => item && item.value === APP_OPTIONS.i18n.default);
      this.translate.use(this.languageSelected.value);
    }
    // this.translate.setDefaultLang(this.languageSelected.value);
    // this.translate.use(this.languageSelected.value);

  }

  onThemeChange($event): void {
    if (this.document.body.classList.contains( this.classNameDarkMode)){
      this.setDarkModeOff();
    }else {
      this.setDarkModeOn();
    }
  }

  private setDarkModeOn(): void{
    this.renderer.addClass(this.document.body,  this.classNameDarkMode);
  }

  private setDarkModeOff(): void{
    this.renderer.removeClass(this.document.body,  this.classNameDarkMode);
  }

  languageChange(result): void {
    this.translate.use(result.value);
    this.translation.setLanguageInSessionStorage(result);
  }


}

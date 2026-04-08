import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-navback-btn',
  templateUrl: './navback-btn.component.html',
  styleUrls: ['./navback-btn.component.scss']
})
export class NavbackBtnComponent implements OnInit {
  
  @Input() isDarkBackground: boolean = false;
  @Input() customLink: string;
  @Output() navBackClicked: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private location: Location,
    private router: Router,
    private _layoutService: LayoutService
  ) {
    this._layoutService.navBackPath$.subscribe({
      next: (path) => {
        if (path?.length > 0) {
          this.customLink = path;
        } else {
          this.customLink = null;
        }
      }
    });
  }

  ngOnInit(): void {}

  back() {
    console.log('[navback-btn] customLink', this.customLink);
    if (this.customLink?.length > 0 ) {
      this.router.navigate([`/${this.customLink}`]);
      //Clear productLotNo before navigating
      if(this.customLink === "mainmenunew"){
        localStorage.removeItem('productLotNo');  
      }     
    } else {
      this.location.back();
    }
    this.navBackClicked.emit(true);
    this._layoutService.onNavBack();
  }

}

import { Component, OnInit } from '@angular/core';
import {Router, ROUTES} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
// @ts-ignore
import {BottomNavigationSelectEvent} from '@progress/kendo-angular-navigation';

@Component({
  selector: 'app-mobile-navigation-menu',
  templateUrl: './mobile-navigation-menu.component.html',
  styleUrls: ['./mobile-navigation-menu.component.scss']
})
export class MobileNavigationMenuComponent implements OnInit {


  public items: Array<any>;

  current = 'home';

  constructor(private translate: TranslateService, private router: Router) { }

  ngOnInit(): void {


    this.items = [
      { text: this.translate.instant('Dashboard'), icon: 'layout-2-by-2',selected: true, path: '/mobile-navigation-list' },
      { text: this.translate.instant('mobile-menu.home'), icon: 'home', path: '/dashboard-one' },
      { text: this.translate.instant('Notifications'), icon: 'notification', path: '/notifications-menu'}
    ];

    this.translate.onLangChange.asObservable().subscribe( () => {

      // TODO: find a better way to address this
      // reset array to trigger a ngmodel rerender
      this.items = [];

      this.items = [
         { text: this.translate.instant('Dashboard'), icon: 'layout-2-by-2',selected: true, path: '/mobile-navigation-list' },
         { text: this.translate.instant('mobile-menu.home'), icon: 'home', path: '/dashboard-one' },
         { text: this.translate.instant('Notifications'), icon: 'notification', path: '/notifications-menu'}
      ];
    });

  }

  public onSelect(ev: BottomNavigationSelectEvent): void {
    this.router.navigate([ev.item.path]);
  }

}

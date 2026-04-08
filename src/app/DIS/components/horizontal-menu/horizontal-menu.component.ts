import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { config } from '@dis/settings/sidebar.config';
import {Router} from '@angular/router';
import {MenuService} from '@dis/services/menu/menu.service';
import {RoleTypes} from '@dis/auth/roles.enum';

@Component({
  selector: 'app-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss'],
  encapsulation:  ViewEncapsulation.None,
})
export class HorizontalMenuComponent implements OnInit {

  items: any[];
  isLoggedIn$: Promise<boolean>;

  constructor(private router: Router, private menuService: MenuService) {
  }

  ngOnInit(): void {
    this.items = this.menuService.filterMenuItems(config);
    this.isLoggedIn$ = this.menuService.checkIsLoggedIn();
  }

  isLoginView(): boolean {
    return this.menuService.isLoginView();
  }

  isLinkActivated(elevation: Array<RoleTypes>): boolean {
    return this.menuService.isLinkActivated(elevation);
  }


}

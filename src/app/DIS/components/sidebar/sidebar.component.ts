import {Component, OnInit} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { config } from '@dis/settings/sidebar.config';
import { APP_OPTIONS } from '@dis/settings/behavior.config';
import { Router } from '@angular/router';

// TODO: Roles
import { AuthGuard } from '@dis/auth/auth.guard';
import { RoleTypes } from '@dis/auth/roles.enum';
import {MenuService} from '@dis/services/menu/menu.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  animations: [
    trigger('toggleSidebar', [
      state('collapsed, void', style({ transform: 'translateX(-100%)' })),
      state('expanded', style({ transform: 'translateX(0)' })),
      transition('collapsed <=> expanded', [animate(200), animate(200)])
    ])
  ],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{
  menuGroups = config; // Change this to populate menu items
  sidebarState: string;
  isLoggedIn$: Promise<boolean>;

  isPanelItemCollapsedByDefault: boolean;

  // constructor(private _roleGuardService: RoleGuardService) {
  constructor(
    private menuService: MenuService
  ) {
    this.isPanelItemCollapsedByDefault = APP_OPTIONS.sidemenu.panelItemCollapsedByDefault;
  }

  ngOnInit(): void {
    // this.menuGroups = this.menuGroups.filter(groups => groups.items && groups.items.length > 0 );
    this.menuGroups = this.menuService.filterMenuItems(this.menuGroups);
    this.isLoggedIn$ = this.menuService.checkIsLoggedIn();
  }

  isLoginView(): boolean {
    return this.menuService.isLoginView();
  }

  isLinkActivated(elevation: Array<RoleTypes>): boolean {
    return this.menuService.isLinkActivated(elevation);
  }

  showFirstPanelItems(index): any {
    if (!this.isPanelItemCollapsedByDefault && index === 0 ){
      return true;
    }
    return;


  }
}

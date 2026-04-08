import { Component, Input, EventEmitter, Output } from '@angular/core';
import { User } from './profile-menu.props';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {
  @Input() user: User;
  @Input() currentMenu: String;
  @Output() currentMenuChange = new EventEmitter<string>();

  constructor() {}

  onClick(menuId) {
    if (menuId === 'none' && this.currentMenu !== 'profile') return;
    this.currentMenuChange.emit(menuId);
  }
}

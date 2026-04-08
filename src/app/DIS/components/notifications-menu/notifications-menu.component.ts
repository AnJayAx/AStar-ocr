import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Notification } from './notifications-menu.props';
import {getNotifications} from '@dis/settings/behavior.config';

@Component({
  selector: 'app-notifications-menu',
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.scss']
})
export class NotificationsMenuComponent {
  @Input() notifications: Array<Notification>;
  @Input() onNotificationClick: Function;
  @Input() currentMenu: String;
  @Output() currentMenuChange = new EventEmitter<string>();

  constructor() {}
  async ngOnInit() {
    this.getData();
  }


  onClick(menuId) {
    if (menuId === 'none' && this.currentMenu !== 'notifications') return;
    this.currentMenuChange.emit(menuId);
  }

  assignColor(status) {
    // '1': success; '2': warning; '3': error
    const color =
      status === '1'
        ? '--success'
        : status === '2'
        ? '--warning'
        : status === '3'
        ? '--error'
        : '--gray-600';
    return getComputedStyle(document.documentElement).getPropertyValue(color);
  }
  onButtonClick(){
      this.notifications = [];
  }
  getData = async () => {
      this.notifications = await getNotifications();
  }


}

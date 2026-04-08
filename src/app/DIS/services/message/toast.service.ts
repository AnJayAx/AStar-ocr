import {Injectable, TemplateRef} from '@angular/core';
import {
  Animation,
  NotificationService,
  Position,
  Type
} from '@progress/kendo-angular-notification';
import {APP_OPTIONS} from '@dis/settings/behavior.config';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  options: any;

  constructor(private notificationService: NotificationService) {
    this.options = APP_OPTIONS.toast;
  }

  default(msg: string | TemplateRef<any>, durationInMs: number = APP_OPTIONS.toast.hideAfter): void {
    this.createMessage(msg, 'default', durationInMs);
  }

  success(msg: string | TemplateRef<any>, durationInMs: number = APP_OPTIONS.toast.hideAfter): void {
    this.createMessage(msg, 'success', durationInMs);
  }

  warning(msg: string | TemplateRef<any>, durationInMs: number = APP_OPTIONS.toast.hideAfter): void {
    this.createMessage(msg, 'warning', durationInMs);
  }

  info(msg: string | TemplateRef<any>, durationInMs: number = APP_OPTIONS.toast.hideAfter): void {
    this.createMessage(msg, 'info', durationInMs);
  }

  error(msg: string | TemplateRef<any>, durationInMs: number = APP_OPTIONS.toast.hideAfter): void {
    this.createMessage(msg, 'error', durationInMs);
  }

  createMessage(msg: string | TemplateRef<any>, style: string, duration: number): void {

    this.notificationService.show({
      content: msg,
      hideAfter: duration,
      position: APP_OPTIONS.toast.position as Position,
      animation: APP_OPTIONS.toast.animation as Animation,
      type: {style, icon: APP_OPTIONS.toast.icon } as Type,
      closeTitle: APP_OPTIONS.toast.closeTitle,
      closable: APP_OPTIONS.toast.closable,
      width: APP_OPTIONS.toast.width,
    });
  }

}

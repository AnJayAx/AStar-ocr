import { Injectable, ViewChild, ViewContainerRef } from '@angular/core';
import { NotificationService } from '@progress/kendo-angular-notification';

@Injectable({
  providedIn: 'root'
})
export class PtOperationDetailsToastService {

  constructor(private notificationService: NotificationService) { }

  showToast(msg: string, containerRef: ViewContainerRef): void {
    this.notificationService.show({
      content: msg,
      appendTo: containerRef,
      position: { horizontal: "center", vertical: "top" },
      type: { style: "info", icon: true },
      hideAfter: 3000,
    });
  }
}

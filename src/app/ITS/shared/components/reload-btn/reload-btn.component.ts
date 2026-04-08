import { Component, OnInit, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@dis/services/message/toast.service';
import { RefreshService } from '@its/shared/services/refresh.service';

@Component({
  selector: 'app-reload-btn',
  templateUrl: './reload-btn.component.html',
  styleUrls: ['./reload-btn.component.scss'],
})
export class ReloadBtnComponent implements OnInit {

  @Input() componentType: any; /* Pass in component using this button */
  @Input() elementRef: ElementRef;
  @Input() isTextIncluded: boolean = false;
  @Input() hideToast: boolean = false;
  @Output() clicked: EventEmitter<boolean> = new EventEmitter(false);
  @Output() reloaded: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private _router: Router,
    private _refresh: RefreshService,
    private _toast: ToastService,
  ) { }

  ngOnInit(): void {
  }

  reload() {
    this.clicked.emit(true);

    if (!!this.componentType && !!this.elementRef) {
      const queryParamExists = this._router.url.split(";").length > 1;
      if (queryParamExists) {
        const urlComponents = this._router.url.split(";");
        const resourceURL = urlComponents[0];
        const params = urlComponents.slice(1,urlComponents.length);
        const paramObject = {}
        params.forEach(param => {
          const key=param.split('=')[0]
          const value=param.split('=')[1]
          paramObject[key]=value
        });

        this._router.navigate(['/mainmenunew'], { skipLocationChange: true }).then(() => {
          this._router.navigate([`/${resourceURL}`, paramObject]).then(() => {
            this.onNavigateDone();
          });
        });  
      } else {
        const currentURL = this._router.url;
        this._router.navigate(['/mainmenunew'], { skipLocationChange: true }).then(() => {
          this._router.navigate([`/${currentURL}`]).then(() => {
            this.onNavigateDone();
          });
        });
      }

    } else {
      alert('Error occurred on reload');
      this.reloaded.emit(false);
    }
  }

  private onNavigateDone() {
    this._refresh.refresh();
    this.reloaded.emit(true);
    if (!this.hideToast) {
      this._toast.success('Reloaded', 1000);
    }
  }

}

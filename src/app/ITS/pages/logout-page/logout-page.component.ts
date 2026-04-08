import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil } from 'rxjs';
import { InitPageEventQueueService } from '../init-page/init-page-event-queue.service';
import { InitPageEventType } from '@its/shared/constants/constants';
import { Router } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'src/app/app.module';
import { LayoutService } from '@dis/services/layout/layout.service';

/* OBSOLETE COMPONENT */
@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.scss']
})
export class LogoutPageComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  isLoggedOut: boolean = false;

  constructor(
    private _keycloak: KeycloakService,
    private ref: ChangeDetectorRef,
    private eventQueue: InitPageEventQueueService,
    private router: Router,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.setDefaultTitleDisplay();

    this.eventQueue.on(InitPageEventType.LOGIN_DONE).subscribe({
      next: (event) => {
        console.log('LOGOUT >>', event);
        this.isLoggedOut = false;
        // this.ref.detectChanges();
      }
    });

    this.eventQueue.on(InitPageEventType.LOGGED_OUT).subscribe({
      next: (event) => {
        console.log('LOGOUT >>', event);
        this.isLoggedOut = true;
        // this.ref.detectChanges();
      }
    });
  }

  ngOnInit(): void {}

  nav() {
    this.isLoggedOut = false;
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    this.router.navigateByUrl('init-page', { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
    console.log('>>> DESTROYED logout-page');
  }

  reinitializeApp() {
    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
  }

}

import {Component, OnInit, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {

  isTokenReady = false;
  isKeycloakSetupCompleted: boolean = false;

  constructor(
    private router: Router, 
    private zone: NgZone,
  ){}

  ngOnInit(): void {}

  initializeApp() {
    async (params: any) => {
      await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        console.log('Mobile browser URL Opened !');
        this.zone.run(() => {

          console.log('event', event);

          let url = event.url;
          if (url.includes('localhost')) {
            this.router.navigateByUrl('/');
          } else {
            // Example url: angular.test.com
            const slug = event.url.split(".com").pop();
            if (slug) {
              this.router.navigateByUrl(slug);
            }
            // If no match, do nothing - let regular routing
            // logic take over
          }
        });
      });
    }
  }
}

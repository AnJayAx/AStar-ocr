import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Surface uncaught errors with stack traces in Android logcat.
// (Capacitor's console logging sometimes loses the originating file/stack.)
window.addEventListener('error', (ev: ErrorEvent) => {
  const err = ev.error as any;
  const stack = err?.stack ? String(err.stack) : '';
  console.error('[window.error]', ev.message || err || ev, stack);
});

window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  const reason = (ev as any).reason;
  const stack = reason?.stack ? String(reason.stack) : '';
  console.error('[unhandledrejection]', reason || ev, stack);
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

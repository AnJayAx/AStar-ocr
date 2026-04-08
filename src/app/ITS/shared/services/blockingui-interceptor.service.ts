import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlockUI, BlockUIService, NgBlockUI, BLOCKUI_DEFAULT } from 'ng-block-ui';
import { EMPTY, finalize, map, Observable, switchMap, tap, timer } from 'rxjs';

@Injectable()
export class BlockinguiInterceptorService implements HttpInterceptor {
  @BlockUI(BLOCKUI_DEFAULT) blockUI: NgBlockUI;

  constructor(private blockUIService: BlockUIService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('intercepted request', request);
    
    if (request.params.get('skipBlockingUI') == 'true') {
      console.log('skip blockUI', request.url);
      this.blockUIService.resetGlobal();
      return next.handle(request);
    }

    // console.log('enable blockUI', request.url);
    const startTime = Date.now();

    return next.handle(request).pipe(
      finalize(() => {
        const elapsedTime = Date.now() - startTime;

        console.log(`${request.url} finalized => elapsedTime`, elapsedTime);
        // if (elapsedTime >= 1000 && !request.responseType) {
        //   this.blockUIService.start(BLOCKUI_DEFAULT);
        //   console.log('blockUI started');

        //   if(request.responseType) {
        //     this.blockUIService.stop(BLOCKUI_DEFAULT);
        //     console.log('blockUI stopped');
        //   }
        // } else {
        //   console.log('skip blockUI');
        //   this.blockUIService.stop(BLOCKUI_DEFAULT);
        //   this.blockUIService.resetGlobal();
        // }
      })
    );

    // const startTime = Date.now();
    // const start = timer(1000).pipe(
    //   tap(() => {
    //     console.log('start blockUI', Date.now() - startTime);
    //     this.blockUIService.start(BLOCKUI_DEFAULT);
    //   })
    // );

    // const end = next.handle(request).pipe(
    //   finalize(() => {
    //     this.blockUIService.stop(BLOCKUI_DEFAULT);
    //   })
    // );

    // return start.pipe(switchMap(() => end));




    const requestStartTime = Date.now();
    this.blockUIService.start(BLOCKUI_DEFAULT);

    return next.handle(request).pipe(
      finalize(() => {
        console.log('request finalize', request);
        const elapsedTime = Date.now() - requestStartTime;
        
        if (elapsedTime >= 1000) {
          this.blockUIService.resetGlobal();
          this.blockUIService.stop(BLOCKUI_DEFAULT);

          console.log('STOP blockUI >= 1000', request);
          console.log('STOP blockUI >= 1000', this.blockUI);
          console.log(elapsedTime);
  
        } 
        else {
          setTimeout(() => {
            this.blockUIService.resetGlobal();
            this.blockUIService.stop(BLOCKUI_DEFAULT);

            console.log('STOP blockUI < 1000', request);
            console.log('STOP blockUI < 1000', this.blockUI);
            console.log(elapsedTime);
    
          }, 1000 - elapsedTime);
        }
      })
    );
  }
}
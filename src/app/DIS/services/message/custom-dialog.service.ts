import {Injectable, NgZone} from '@angular/core';
import { RegCustomDialogComponent } from '@its/modules/Registration/components/reg-custom-dialog/reg-custom-dialog.component';
import { ScanViewInvalidTagsService } from '@its/shared/components/Scanning/scan-view/scan-view-invalid-tags.service';
import {DialogCloseResult, DialogRef, DialogResult, DialogService} from '@progress/kendo-angular-dialog';
import {Observable, Subscriber, map, race} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomDialogService {

  constructor(  private dialogService: DialogService, private _invalidTagsService: ScanViewInvalidTagsService,
                private ngZone: NgZone) { }

  confirm(content: string = 'Are you sure you want to continue'): Observable<any>{
    return new Observable(observer => {
      this.ngZone.run(() => {
        this.dialogService.open({
          title: 'Please confirm',
          content: content,
          actions: [
            { text: 'Yes', primary: true, themeColor: "primary"},
            { text: 'No' },
          ],
          width: 450,
          height: 200,
          minWidth: 250,
        }).result.subscribe(res => {
          observer.next(res);
          observer.complete();
        });

      });
    });
  }


  /*
  message(title: string,
          message: string,
          actions: Array<{text: string, primary: boolean}>,
          level: 'success' | 'error' | 'warning' | 'info'): Observable<any>{
    return new Observable(observer => {
      this.ngZone.run(() => {
        const dialog =  this.dialogService.open({
          title,
          content: message,
          actions,
          width: 450,
          height: 200,
          minWidth: 250,
        });

        dialog.dialog.location.nativeElement.classList.add(level);

        dialog.result.subscribe(res => {
          observer.next(res);
          observer.complete();
        });



      });
    });
  }
  */

  message(title: string,
    message: string,
    actions: Array<{text: string, primary: boolean, themeColor?: string}>,
    level: 'success' | 'error' | 'warning' | 'info'): Observable<any> {
      return new Observable(observer => {
      this.ngZone.run(() => {
        const dialog =  this.dialogService.open({
          title,
          content: message,
          actions,
          width: 300,
          // height: 150,
          minWidth: 200,
          minHeight: 200
        });

        dialog.dialog.location.nativeElement.classList.add(level);

        dialog.result.subscribe(res => {
          observer.next(res);
          observer.complete();
        });
      });
    });
  }

  private observerRef: Subscriber<any>;
  private dialogRef: DialogRef;

  /* insert HTML string */
  messageHTML(
    title: string,
    html: string,
    actions: Array<{text: string, primary: boolean}>,
    level: 'success' | 'error' | 'warning' | 'info'
  ): Observable<any> {
    return new Observable(observer => {

      this.ngZone.run(() => {
        const dialog =  this.dialogService.open({
          title,
          content: RegCustomDialogComponent,
          actions,
          width: 320,
          minWidth: 180,
          minHeight: 250
        });

        this.completeCustomDialog();
        this.observerRef = observer;
        this.dialogRef = dialog;

        const splitLineDialog = dialog.content.instance as RegCustomDialogComponent;
        splitLineDialog.htmlStr = html;

        dialog.dialog.location.nativeElement.classList.add(level);

        dialog.result.subscribe(res => {
          observer.next(res);
          observer.complete();
        });
      });
    });
  }

  completeCustomDialog(res: DialogResult = DialogCloseResult) {
    console.log('DEBUG completeCustomDialog', this.observerRef);
    if (this.observerRef && this.dialogRef) {
      this.observerRef.next(res);
      this.observerRef.complete();
      this.observerRef = null;
    }
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  invalidTagsDialog(
    title: string,
    html: string,
    actions: Array<{text: string, primary: boolean}>,
    level: 'success' | 'error' | 'warning' | 'info'
  ): Observable<any> {
    return new Observable(observer => {
      this.ngZone.run(() => {
        const dialog =  this.dialogService.open({
          title,
          content: RegCustomDialogComponent,
          actions,
          width: 320,
          minWidth: 180,
          minHeight: 250
        });

        const splitLineDialog = dialog.content.instance as RegCustomDialogComponent;
        splitLineDialog.htmlStr = html;

        dialog.dialog.location.nativeElement.classList.add(level);

        // race(
        //   this._invalidTagsService.showInvalidTags$.pipe(map(show => ({ source: 'invalid-tags-service', value: show }))),
        //   dialog.result.pipe(map(response => ({ source: 'dialog-button-click', value: response })))
        // ).subscribe({
        //   next: (res) => {
        //     console.log(' invalidTagsDialog res', res);
        //     if (res.source === 'invalid-tags-service') {
        //       if (!res.value) {
        //         observer.next(DialogCloseResult);
        //         observer.complete();
        //       }
        //     } else if (res.source === 'dialog-button-click') {
        //       observer.next(res.value);
        //       observer.complete();
        //     }
        //   }
        // });

        this._invalidTagsService.showInvalidTags$.subscribe(show => {
          if (!show) {
            dialog.close();
          }
        });

        dialog.result.subscribe(res => {
          observer.next(res);
          observer.complete();
        });
      });
    });
  }


}

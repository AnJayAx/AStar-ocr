import { Injectable } from '@angular/core';
import {HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ToastService} from '@dis/services/message/toast.service';

export const BYPASS_HTTP_INTERCEPTOR = new HttpContextToken(() => false);
@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private toast: ToastService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    if (token){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    if (request.context.get(BYPASS_HTTP_INTERCEPTOR) === true) {
      return next.handle(request);
    } else {
      return next.handle(request)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            let errorMsg = '';
            if (error.error instanceof ErrorEvent) {
              errorMsg = `Error: ${error.message}`;
            }
            else {
              errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
            }

            this.toast.error(errorMsg);
            return throwError(error);
          })
        );
    }

  }
}

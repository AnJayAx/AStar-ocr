import { TestBed } from '@angular/core/testing';

import { HttpInterceptorService } from './http-interceptor.service';
import {HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ToastService} from '@dis/services/message/toast.service';
import {NotificationService} from '@progress/kendo-angular-notification';

describe('HttpInterceptorService', () => {
  let interceptorService: HttpInterceptorService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let toast: ToastService;

  const testUrl = '/data';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpInterceptorService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpInterceptorService,
          multi: true,
        },
        ToastService,
        NotificationService
      ],
      imports: [HttpClientTestingModule]});
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptorService = TestBed.inject(HttpInterceptorService);
    toast = TestBed.inject(ToastService);
    spyOn(toast, 'error').and.callThrough();
    // spyOn(toast, 'error').and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(interceptorService).toBeTruthy();
  });

  it('should throw error when error', () => {
    const errorResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    // Make an HTTP GET request
    httpClient.get<any>(testUrl).subscribe(
      () => fail('shouldnt be resolve as there should be error'),
      () => {
        expect(toast.error).toHaveBeenCalled();
      }
    );

    // The following `expectOne()` will match the request's URL.
    const req = httpMock.expectOne(testUrl);

    // Respond with mock error
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });


  });

});

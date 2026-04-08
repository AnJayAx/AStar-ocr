import { TestBed } from '@angular/core/testing';

import { ProductreceiveService } from './productreceive.service';

describe('ProductreceiveService', () => {
  let service: ProductreceiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductreceiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

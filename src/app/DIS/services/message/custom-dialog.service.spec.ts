import { TestBed } from '@angular/core/testing';

import { CustomDialogService } from './custom-dialog.service';
import {DialogContainerService, DialogService} from '@progress/kendo-angular-dialog';

describe('CustomDialogService', () => {
  let service: CustomDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DialogService, DialogContainerService]
    });
    service = TestBed.inject(CustomDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

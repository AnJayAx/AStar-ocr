import { TestBed } from '@angular/core/testing';

import { CustomMessageService } from './custom-message.service';
import { TranslateModule, TranslateService} from '@ngx-translate/core';

describe('CustomMessageService', () => {
  let service: CustomMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslateService],
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(CustomMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

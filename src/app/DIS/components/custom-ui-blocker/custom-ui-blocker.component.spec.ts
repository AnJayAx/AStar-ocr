import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomUiBlockerComponent } from './custom-ui-blocker.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('CustomUiBlockerComponent', () => {
  let component: CustomUiBlockerComponent;
  let fixture: ComponentFixture<CustomUiBlockerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TranslateService],
      declarations: [ CustomUiBlockerComponent ],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomUiBlockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

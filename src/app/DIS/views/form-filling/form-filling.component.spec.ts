import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFillingComponent } from './form-filling.component';
import {ToastService} from '@dis/services/message/toast.service';
import {NotificationService} from '@progress/kendo-angular-notification';
import {CustomDialogService} from '@dis/services/message/custom-dialog.service';
import {DialogContainerService, DialogService} from '@progress/kendo-angular-dialog';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';

describe('FormFillingComponent', () => {
  let component: FormFillingComponent;
  let fixture: ComponentFixture<FormFillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormFillingComponent ],
      providers: [ToastService, NotificationService, CustomDialogService, DialogService, DialogContainerService],
      imports: [HttpClientModule, TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

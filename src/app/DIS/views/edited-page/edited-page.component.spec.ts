import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditedPageComponent } from './edited-page.component';
import { HttpClientModule} from '@angular/common/http';
import {ToastService} from '@dis/services/message/toast.service';
import {NotificationService} from '@progress/kendo-angular-notification';
import {TranslateModule} from '@ngx-translate/core';

describe('EditedPageComponent', () => {
  let component: EditedPageComponent;
  let fixture: ComponentFixture<EditedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ToastService, NotificationService],
      declarations: [ EditedPageComponent ],
      imports: [HttpClientModule, TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

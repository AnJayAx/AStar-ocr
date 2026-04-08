import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesComponent } from './tables.component';
import {ToastService} from '@dis/services/message/toast.service';
import {NotificationService} from '@progress/kendo-angular-notification';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {CustomDialogService} from '@dis/services/message/custom-dialog.service';
import {DialogContainerService, DialogService} from '@progress/kendo-angular-dialog';

describe('TablesComponent', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablesComponent ],
      providers: [ToastService, NotificationService, CustomDialogService, DialogService, DialogContainerService],
      imports: [HttpClientModule, TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

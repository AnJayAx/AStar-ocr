import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOneComponent } from './dashboard-one.component';
import {MocksLocalService} from '@dis/services/mocks/mocks.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('DashboardOneComponent', () => {
  let component: DashboardOneComponent;
  let fixture: ComponentFixture<DashboardOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MocksLocalService, TranslateService],
      declarations: [ DashboardOneComponent ],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

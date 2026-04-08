import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTwoComponent } from './dashboard-two.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('DashboardTwoComponent', () => {
  let component: DashboardTwoComponent;
  let fixture: ComponentFixture<DashboardTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardTwoComponent ],
      providers: [TranslateService],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

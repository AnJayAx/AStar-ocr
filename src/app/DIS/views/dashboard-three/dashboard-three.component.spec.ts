import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardThreeComponent } from './dashboard-three.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('DashboardThreeComponent', () => {
  let component: DashboardThreeComponent;
  let fixture: ComponentFixture<DashboardThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardThreeComponent ],
      providers: [TranslateService],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

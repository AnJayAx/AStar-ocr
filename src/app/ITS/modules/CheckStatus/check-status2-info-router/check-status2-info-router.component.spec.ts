import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckStatus2InfoRouterComponent } from './check-status2-info-router.component';

describe('CheckStatus2InfoRouterComponent', () => {
  let component: CheckStatus2InfoRouterComponent;
  let fixture: ComponentFixture<CheckStatus2InfoRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckStatus2InfoRouterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckStatus2InfoRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

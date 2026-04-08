import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReturnModuleComponent } from './loan-return-module.component';

describe('LoanReturnModuleComponent', () => {
  let component: LoanReturnModuleComponent;
  let fixture: ComponentFixture<LoanReturnModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanReturnModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanReturnModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

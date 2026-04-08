import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReturnModuleFormComponent } from './loan-return-module-form.component';

describe('LoanReturnModuleFormComponent', () => {
  let component: LoanReturnModuleFormComponent;
  let fixture: ComponentFixture<LoanReturnModuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanReturnModuleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanReturnModuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

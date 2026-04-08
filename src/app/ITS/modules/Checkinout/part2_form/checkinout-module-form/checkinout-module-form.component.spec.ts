import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinoutModuleFormComponent } from './checkinout-module-form.component';

describe('CheckinoutModuleFormComponent', () => {
  let component: CheckinoutModuleFormComponent;
  let fixture: ComponentFixture<CheckinoutModuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckinoutModuleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinoutModuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

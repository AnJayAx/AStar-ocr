import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinoutModuleComponent } from './checkinout-module.component';

describe('CheckinoutModuleComponent', () => {
  let component: CheckinoutModuleComponent;
  let fixture: ComponentFixture<CheckinoutModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckinoutModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinoutModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

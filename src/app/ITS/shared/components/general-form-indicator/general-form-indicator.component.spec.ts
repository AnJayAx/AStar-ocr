import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralFormIndicatorComponent } from './general-form-indicator.component';

describe('GeneralFormIndicatorComponent', () => {
  let component: GeneralFormIndicatorComponent;
  let fixture: ComponentFixture<GeneralFormIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralFormIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralFormIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

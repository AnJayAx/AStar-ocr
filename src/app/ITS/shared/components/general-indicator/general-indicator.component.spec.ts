import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralIndicatorComponent } from './general-indicator.component';

describe('GeneralIndicatorComponent', () => {
  let component: GeneralIndicatorComponent;
  let fixture: ComponentFixture<GeneralIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingScanButtonComponent } from './floating-scan-button.component';

describe('FloatingScanButtonComponent', () => {
  let component: FloatingScanButtonComponent;
  let fixture: ComponentFixture<FloatingScanButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingScanButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingScanButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

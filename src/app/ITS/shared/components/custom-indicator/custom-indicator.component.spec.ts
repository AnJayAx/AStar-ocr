import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomIndicatorComponent } from './custom-indicator.component';

describe('CustomIndicatorComponent', () => {
  let component: CustomIndicatorComponent;
  let fixture: ComponentFixture<CustomIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

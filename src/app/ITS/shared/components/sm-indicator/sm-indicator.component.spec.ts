import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmIndicatorComponent } from './sm-indicator.component';

describe('SmIndicatorComponent', () => {
  let component: SmIndicatorComponent;
  let fixture: ComponentFixture<SmIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

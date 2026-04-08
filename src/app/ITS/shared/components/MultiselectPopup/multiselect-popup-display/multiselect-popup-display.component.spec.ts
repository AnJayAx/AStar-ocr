import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectPopupDisplayComponent } from './multiselect-popup-display.component';

describe('MultiselectPopupDisplayComponent', () => {
  let component: MultiselectPopupDisplayComponent;
  let fixture: ComponentFixture<MultiselectPopupDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiselectPopupDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiselectPopupDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

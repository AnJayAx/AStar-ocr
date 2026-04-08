import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectPopupSelectionComponent } from './multiselect-popup-selection.component';

describe('MultiselectPopupSelectionComponent', () => {
  let component: MultiselectPopupSelectionComponent;
  let fixture: ComponentFixture<MultiselectPopupSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiselectPopupSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiselectPopupSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

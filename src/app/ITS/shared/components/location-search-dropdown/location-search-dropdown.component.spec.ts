import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationSearchDropdownComponent } from './location-search-dropdown.component';

describe('LocationSearchDropdownComponent', () => {
  let component: LocationSearchDropdownComponent;
  let fixture: ComponentFixture<LocationSearchDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationSearchDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationSearchDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

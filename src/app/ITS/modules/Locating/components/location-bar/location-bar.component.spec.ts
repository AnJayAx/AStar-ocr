import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationBarComponent } from './location-bar.component';

describe('LocationBarComponent', () => {
  let component: LocationBarComponent;
  let fixture: ComponentFixture<LocationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

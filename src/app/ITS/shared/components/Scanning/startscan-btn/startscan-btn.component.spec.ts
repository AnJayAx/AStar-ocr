import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartscanBtnComponent } from './startscan-btn.component';

describe('StartscanBtnComponent', () => {
  let component: StartscanBtnComponent;
  let fixture: ComponentFixture<StartscanBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartscanBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartscanBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

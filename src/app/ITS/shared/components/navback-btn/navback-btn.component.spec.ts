import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbackBtnComponent } from './navback-btn.component';

describe('NavbackBtnComponent', () => {
  let component: NavbackBtnComponent;
  let fixture: ComponentFixture<NavbackBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbackBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbackBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

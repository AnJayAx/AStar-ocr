import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenuNewListComponent } from './main-menu-new-list.component';

describe('MainmenunewListComponent', () => {
  let component: MainMenuNewListComponent;
  let fixture: ComponentFixture<MainMenuNewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainMenuNewListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMenuNewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

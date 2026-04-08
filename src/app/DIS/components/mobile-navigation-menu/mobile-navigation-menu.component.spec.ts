import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNavigationMenuComponent } from './mobile-navigation-menu.component';

describe('MobileNavigationMenuComponent', () => {
  let component: MobileNavigationMenuComponent;
  let fixture: ComponentFixture<MobileNavigationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileNavigationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileNavigationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

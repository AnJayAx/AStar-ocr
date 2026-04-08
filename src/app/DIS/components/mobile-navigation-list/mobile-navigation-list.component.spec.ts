import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNavigationListComponent } from './mobile-navigation-list.component';

describe('MobileNavigationListComponent', () => {
  let component: MobileNavigationListComponent;
  let fixture: ComponentFixture<MobileNavigationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileNavigationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileNavigationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

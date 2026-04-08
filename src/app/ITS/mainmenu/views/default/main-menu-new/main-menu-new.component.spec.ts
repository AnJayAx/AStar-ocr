import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenuNewComponent } from './main-menu-new.component';

describe('MainMenuNewComponent', () => {
  let component: MainMenuNewComponent;
  let fixture: ComponentFixture<MainMenuNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainMenuNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMenuNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

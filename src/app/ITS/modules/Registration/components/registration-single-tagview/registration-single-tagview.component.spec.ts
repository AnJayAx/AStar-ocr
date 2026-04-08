import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationSingleTagviewComponent } from './registration-single-tagview.component';

describe('RegistrationSingleTagviewComponent', () => {
  let component: RegistrationSingleTagviewComponent;
  let fixture: ComponentFixture<RegistrationSingleTagviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationSingleTagviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationSingleTagviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

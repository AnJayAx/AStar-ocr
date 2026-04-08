import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUrlFormComponent } from './set-url-form.component';

describe('SetUrlFormComponent', () => {
  let component: SetUrlFormComponent;
  let fixture: ComponentFixture<SetUrlFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetUrlFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUrlFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

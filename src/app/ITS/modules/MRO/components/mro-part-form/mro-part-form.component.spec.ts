import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MroPartFormComponent } from './mro-part-form.component';

describe('MroPartFormComponent', () => {
  let component: MroPartFormComponent;
  let fixture: ComponentFixture<MroPartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MroPartFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MroPartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

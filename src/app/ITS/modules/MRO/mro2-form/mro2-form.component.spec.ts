import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MRO2FormComponent } from './mro2-form.component';

describe('MRO2FormComponent', () => {
  let component: MRO2FormComponent;
  let fixture: ComponentFixture<MRO2FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MRO2FormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MRO2FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

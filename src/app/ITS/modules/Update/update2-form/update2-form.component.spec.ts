import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Update2FormComponent } from './update2-form.component';

describe('Update2FormComponent', () => {
  let component: Update2FormComponent;
  let fixture: ComponentFixture<Update2FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Update2FormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Update2FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

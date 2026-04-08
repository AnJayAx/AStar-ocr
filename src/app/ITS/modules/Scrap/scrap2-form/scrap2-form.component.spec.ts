import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scrap2FormComponent } from './scrap2-form.component';

describe('Scrap2FormComponent', () => {
  let component: Scrap2FormComponent;
  let fixture: ComponentFixture<Scrap2FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Scrap2FormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Scrap2FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

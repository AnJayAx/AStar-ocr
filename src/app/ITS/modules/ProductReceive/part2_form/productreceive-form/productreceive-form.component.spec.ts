import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductreceiveFormComponent } from './productreceive-form.component';

describe('ProductreceiveFormComponent', () => {
  let component: ProductreceiveFormComponent;
  let fixture: ComponentFixture<ProductreceiveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductreceiveFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductreceiveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

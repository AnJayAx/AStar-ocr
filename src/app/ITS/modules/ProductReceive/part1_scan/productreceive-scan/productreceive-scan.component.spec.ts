import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductreceiveScanComponent } from './productreceive-scan.component';

describe('ProductreceiveScanComponent', () => {
  let component: ProductreceiveScanComponent;
  let fixture: ComponentFixture<ProductreceiveScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductreceiveScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductreceiveScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

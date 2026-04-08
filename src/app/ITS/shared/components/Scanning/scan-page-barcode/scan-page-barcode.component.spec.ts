import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanPageBarcodeComponent } from './scan-page-barcode.component';

describe('ScanPageBarcodeComponent', () => {
  let component: ScanPageBarcodeComponent;
  let fixture: ComponentFixture<ScanPageBarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanPageBarcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanPageBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

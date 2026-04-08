import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleBarcodeComponent } from './sample-barcode.component';

describe('SampleBarcodeComponent', () => {
  let component: SampleBarcodeComponent;
  let fixture: ComponentFixture<SampleBarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleBarcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

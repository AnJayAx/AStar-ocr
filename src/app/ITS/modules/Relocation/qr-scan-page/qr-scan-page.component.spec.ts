import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrScanPageComponent } from './qr-scan-page.component';

describe('QrScanPageComponent', () => {
  let component: QrScanPageComponent;
  let fixture: ComponentFixture<QrScanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrScanPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrScanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

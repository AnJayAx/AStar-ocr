import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtItemScanComponent } from './pt-item-scan.component';

describe('PtItemScanComponent', () => {
  let component: PtItemScanComponent;
  let fixture: ComponentFixture<PtItemScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtItemScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtItemScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

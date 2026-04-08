import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtBomScanComponent } from './pt-bom-scan.component';

describe('PtBomScanComponent', () => {
  let component: PtBomScanComponent;
  let fixture: ComponentFixture<PtBomScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtBomScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtBomScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

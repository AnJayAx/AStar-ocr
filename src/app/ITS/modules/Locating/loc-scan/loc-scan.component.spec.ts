import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocScanComponent } from './loc-scan.component';

describe('LocScanComponent', () => {
  let component: LocScanComponent;
  let fixture: ComponentFixture<LocScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

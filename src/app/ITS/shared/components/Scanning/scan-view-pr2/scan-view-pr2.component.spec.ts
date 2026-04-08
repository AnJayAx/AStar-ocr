import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanViewPr2Component } from './scan-view-pr2.component';

describe('ScanViewPr2Component', () => {
  let component: ScanViewPr2Component;
  let fixture: ComponentFixture<ScanViewPr2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanViewPr2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanViewPr2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

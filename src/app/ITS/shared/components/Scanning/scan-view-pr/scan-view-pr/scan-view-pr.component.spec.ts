import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanViewPrComponent } from './scan-view-pr.component';

describe('ScanViewPrComponent', () => {
  let component: ScanViewPrComponent;
  let fixture: ComponentFixture<ScanViewPrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanViewPrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanViewPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

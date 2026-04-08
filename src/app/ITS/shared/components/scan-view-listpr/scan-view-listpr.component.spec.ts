import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanViewListprComponent } from './scan-view-listpr.component';

describe('ScanViewListprComponent', () => {
  let component: ScanViewListprComponent;
  let fixture: ComponentFixture<ScanViewListprComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanViewListprComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanViewListprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

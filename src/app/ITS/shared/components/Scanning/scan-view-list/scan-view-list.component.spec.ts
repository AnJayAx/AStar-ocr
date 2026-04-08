import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanViewListComponent } from './scan-view-list.component';

describe('ScanViewListComponent', () => {
  let component: ScanViewListComponent;
  let fixture: ComponentFixture<ScanViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanViewListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanOverviewComponent } from './st-scan-overview.component';

describe('StScanOverviewComponent', () => {
  let component: StScanOverviewComponent;
  let fixture: ComponentFixture<StScanOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

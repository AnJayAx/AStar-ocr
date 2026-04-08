import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanComponent } from './st-scan.component';

describe('StScanComponent', () => {
  let component: StScanComponent;
  let fixture: ComponentFixture<StScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

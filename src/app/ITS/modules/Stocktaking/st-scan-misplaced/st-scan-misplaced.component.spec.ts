import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanMisplacedComponent } from './st-scan-misplaced.component';

describe('StScanMisplacedComponent', () => {
  let component: StScanMisplacedComponent;
  let fixture: ComponentFixture<StScanMisplacedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanMisplacedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanMisplacedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

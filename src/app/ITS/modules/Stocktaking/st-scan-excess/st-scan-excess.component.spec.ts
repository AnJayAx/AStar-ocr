import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanExcessComponent } from './st-scan-excess.component';

describe('StScanExcessComponent', () => {
  let component: StScanExcessComponent;
  let fixture: ComponentFixture<StScanExcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanExcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanExcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

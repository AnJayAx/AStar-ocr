import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanMenurouterComponent } from './st-scan-menurouter.component';

describe('StScanMenurouterComponent', () => {
  let component: StScanMenurouterComponent;
  let fixture: ComponentFixture<StScanMenurouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanMenurouterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanMenurouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanNoaccessComponent } from './st-scan-noaccess.component';

describe('StScanNoaccessComponent', () => {
  let component: StScanNoaccessComponent;
  let fixture: ComponentFixture<StScanNoaccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanNoaccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanNoaccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

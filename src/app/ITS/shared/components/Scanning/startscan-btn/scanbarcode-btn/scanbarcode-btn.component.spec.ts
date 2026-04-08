import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanbarcodeBtnComponent } from './scanbarcode-btn.component';

describe('ScanbarcodeBtnComponent', () => {
  let component: ScanbarcodeBtnComponent;
  let fixture: ComponentFixture<ScanbarcodeBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanbarcodeBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanbarcodeBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

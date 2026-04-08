import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanrfidBtnComponent } from './scanrfid-btn.component';

describe('ScanrfidBtnComponent', () => {
  let component: ScanrfidBtnComponent;
  let fixture: ComponentFixture<ScanrfidBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanrfidBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanrfidBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

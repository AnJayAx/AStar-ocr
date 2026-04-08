import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanSettingsBtnComponent } from './scan-settings-btn.component';

describe('ScanSettingsBtnComponent', () => {
  let component: ScanSettingsBtnComponent;
  let fixture: ComponentFixture<ScanSettingsBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanSettingsBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanSettingsBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

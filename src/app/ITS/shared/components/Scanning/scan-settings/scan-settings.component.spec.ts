import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanSettingsComponent } from './scan-settings.component';

describe('ScanSettingsComponent', () => {
  let component: ScanSettingsComponent;
  let fixture: ComponentFixture<ScanSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

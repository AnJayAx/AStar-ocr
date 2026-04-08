import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckStatus1ScanComponent } from './check-status1-scan.component';

describe('CheckStatus1ScanComponent', () => {
  let component: CheckStatus1ScanComponent;
  let fixture: ComponentFixture<CheckStatus1ScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckStatus1ScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckStatus1ScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

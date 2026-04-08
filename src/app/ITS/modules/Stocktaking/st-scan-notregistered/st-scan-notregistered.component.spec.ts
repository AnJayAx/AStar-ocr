import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanNotregisteredComponent } from './st-scan-notregistered.component';

describe('StScanNotregisteredComponent', () => {
  let component: StScanNotregisteredComponent;
  let fixture: ComponentFixture<StScanNotregisteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanNotregisteredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanNotregisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

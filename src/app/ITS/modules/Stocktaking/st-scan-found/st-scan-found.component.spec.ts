import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StScanFoundComponent } from './st-scan-found.component';

describe('StScanFoundComponent', () => {
  let component: StScanFoundComponent;
  let fixture: ComponentFixture<StScanFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StScanFoundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StScanFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

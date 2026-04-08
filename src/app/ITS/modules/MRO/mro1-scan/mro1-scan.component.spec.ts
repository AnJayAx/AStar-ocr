import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MRO1ScanComponent } from './mro1-scan.component';

describe('MRO1ScanComponent', () => {
  let component: MRO1ScanComponent;
  let fixture: ComponentFixture<MRO1ScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MRO1ScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MRO1ScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

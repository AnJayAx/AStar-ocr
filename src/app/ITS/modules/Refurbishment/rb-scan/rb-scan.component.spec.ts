import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RbScanComponent } from './rb-scan.component';

describe('RbScanComponent', () => {
  let component: RbScanComponent;
  let fixture: ComponentFixture<RbScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RbScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RbScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

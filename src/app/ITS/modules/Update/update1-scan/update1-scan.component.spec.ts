import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Update1ScanComponent } from './update1-scan.component';

describe('Update1ScanComponent', () => {
  let component: Update1ScanComponent;
  let fixture: ComponentFixture<Update1ScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Update1ScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Update1ScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

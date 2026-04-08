import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scrap1ScanComponent } from './scrap1-scan.component';

describe('Scrap1ScanComponent', () => {
  let component: Scrap1ScanComponent;
  let fixture: ComponentFixture<Scrap1ScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Scrap1ScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Scrap1ScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

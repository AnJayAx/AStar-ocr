import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanmodeButtongroupComponent } from './scanmode-buttongroup.component';

describe('ScanmodeButtongroupComponent', () => {
  let component: ScanmodeButtongroupComponent;
  let fixture: ComponentFixture<ScanmodeButtongroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanmodeButtongroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanmodeButtongroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

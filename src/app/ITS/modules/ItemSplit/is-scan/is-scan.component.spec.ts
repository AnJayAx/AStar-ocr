import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsScanComponent } from './is-scan.component';

describe('IsScanComponent', () => {
  let component: IsScanComponent;
  let fixture: ComponentFixture<IsScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

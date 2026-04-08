import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtQcDialogComponent } from './pt-qc-dialog.component';

describe('PtQcDialogComponent', () => {
  let component: PtQcDialogComponent;
  let fixture: ComponentFixture<PtQcDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtQcDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtQcDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

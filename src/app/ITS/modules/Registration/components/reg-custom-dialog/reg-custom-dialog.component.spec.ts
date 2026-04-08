import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegCustomDialogComponent } from './reg-custom-dialog.component';

describe('RegCustomDialogComponent', () => {
  let component: RegCustomDialogComponent;
  let fixture: ComponentFixture<RegCustomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegCustomDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegCustomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsRepackDialogComponent } from './is-repack-dialog.component';

describe('IsRepackDialogComponent', () => {
  let component: IsRepackDialogComponent;
  let fixture: ComponentFixture<IsRepackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsRepackDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsRepackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

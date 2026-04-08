import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmConfirmMergeComponent } from './sm-confirm-merge.component';

describe('SmConfirmMergeComponent', () => {
  let component: SmConfirmMergeComponent;
  let fixture: ComponentFixture<SmConfirmMergeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmConfirmMergeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmConfirmMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmMergeFromComponent } from './sm-merge-from.component';

describe('SmMergeFromComponent', () => {
  let component: SmMergeFromComponent;
  let fixture: ComponentFixture<SmMergeFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmMergeFromComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmMergeFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

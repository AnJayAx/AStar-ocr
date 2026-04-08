import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmMergeToComponent } from './sm-merge-to.component';

describe('SmMergeToComponent', () => {
  let component: SmMergeToComponent;
  let fixture: ComponentFixture<SmMergeToComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmMergeToComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmMergeToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

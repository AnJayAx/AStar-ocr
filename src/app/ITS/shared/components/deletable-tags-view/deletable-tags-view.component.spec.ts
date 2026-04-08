import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletableTagsViewComponent } from './deletable-tags-view.component';

describe('DeletableTagsViewComponent', () => {
  let component: DeletableTagsViewComponent;
  let fixture: ComponentFixture<DeletableTagsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletableTagsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletableTagsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

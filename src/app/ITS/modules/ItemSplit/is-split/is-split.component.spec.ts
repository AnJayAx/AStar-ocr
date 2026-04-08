import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsSplitComponent } from './is-split.component';

describe('IsSplitComponent', () => {
  let component: IsSplitComponent;
  let fixture: ComponentFixture<IsSplitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsSplitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

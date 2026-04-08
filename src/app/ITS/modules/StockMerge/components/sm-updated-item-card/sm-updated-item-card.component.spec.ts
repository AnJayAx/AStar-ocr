import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmUpdatedItemCardComponent } from './sm-updated-item-card.component';

describe('SmUpdatedItemCardComponent', () => {
  let component: SmUpdatedItemCardComponent;
  let fixture: ComponentFixture<SmUpdatedItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmUpdatedItemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmUpdatedItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

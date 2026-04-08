import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDisplayCardComponent } from './item-display-card.component';

describe('ItemDisplayCardComponent', () => {
  let component: ItemDisplayCardComponent;
  let fixture: ComponentFixture<ItemDisplayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemDisplayCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDisplayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

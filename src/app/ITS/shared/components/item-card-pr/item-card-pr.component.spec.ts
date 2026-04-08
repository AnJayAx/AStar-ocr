import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCardPrComponent } from './item-card-pr.component';

describe('ItemCardPrComponent', () => {
  let component: ItemCardPrComponent;
  let fixture: ComponentFixture<ItemCardPrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemCardPrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCardPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

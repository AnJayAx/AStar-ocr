import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemStatusIndicatorComponent } from './item-status-indicator.component';

describe('ItemStatusIndicatorComponent', () => {
  let component: ItemStatusIndicatorComponent;
  let fixture: ComponentFixture<ItemStatusIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemStatusIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemStatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StItemCardComponent } from './st-item-card.component';

describe('StItemCardComponent', () => {
  let component: StItemCardComponent;
  let fixture: ComponentFixture<StItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StItemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RvListCardComponent } from './rv-list-card.component';

describe('RvListCardComponent', () => {
  let component: RvListCardComponent;
  let fixture: ComponentFixture<RvListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvListCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

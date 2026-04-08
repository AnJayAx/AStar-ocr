import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlTagitemCardComponent } from './pl-tagitem-card.component';

describe('PlTagitemCardComponent', () => {
  let component: PlTagitemCardComponent;
  let fixture: ComponentFixture<PlTagitemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlTagitemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlTagitemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

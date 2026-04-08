import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlListitemCardComponent } from './pl-listitem-card.component';

describe('PlListitemCardComponent', () => {
  let component: PlListitemCardComponent;
  let fixture: ComponentFixture<PlListitemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlListitemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlListitemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

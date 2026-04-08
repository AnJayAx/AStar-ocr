import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StDetailsComponent } from './st-details.component';

describe('StDetailsComponent', () => {
  let component: StDetailsComponent;
  let fixture: ComponentFixture<StDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtItemCardComponent } from './pt-item-card.component';

describe('PtItemCardComponent', () => {
  let component: PtItemCardComponent;
  let fixture: ComponentFixture<PtItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtItemCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

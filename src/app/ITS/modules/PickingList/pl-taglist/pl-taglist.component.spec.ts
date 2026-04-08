import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlTaglistComponent } from './pl-taglist.component';

describe('PlTaglistComponent', () => {
  let component: PlTaglistComponent;
  let fixture: ComponentFixture<PlTaglistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlTaglistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlTaglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

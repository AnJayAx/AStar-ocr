import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StListviewComponent } from './st-listview.component';

describe('StListviewComponent', () => {
  let component: StListviewComponent;
  let fixture: ComponentFixture<StListviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StListviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StListviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

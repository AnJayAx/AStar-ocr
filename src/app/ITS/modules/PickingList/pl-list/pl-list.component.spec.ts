import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlListComponent } from './pl-list.component';

describe('PlListComponent', () => {
  let component: PlListComponent;
  let fixture: ComponentFixture<PlListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

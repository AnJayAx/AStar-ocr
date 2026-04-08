import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocSearchComponent } from './loc-search.component';

describe('LocSearchComponent', () => {
  let component: LocSearchComponent;
  let fixture: ComponentFixture<LocSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

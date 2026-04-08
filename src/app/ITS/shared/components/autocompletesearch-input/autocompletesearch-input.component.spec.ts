import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompletesearchInputComponent } from './autocompletesearch-input.component';

describe('AutocompletesearchInputComponent', () => {
  let component: AutocompletesearchInputComponent;
  let fixture: ComponentFixture<AutocompletesearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutocompletesearchInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompletesearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

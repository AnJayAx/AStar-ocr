import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompletesearchObjectInputComponent } from './autocompletesearch-object-input.component';

describe('AutocompletesearchObjectInputComponent', () => {
  let component: AutocompletesearchObjectInputComponent;
  let fixture: ComponentFixture<AutocompletesearchObjectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutocompletesearchObjectInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompletesearchObjectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

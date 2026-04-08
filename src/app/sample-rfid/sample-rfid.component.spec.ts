import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleRfidComponent } from './sample-rfid.component';

describe('SampleRfidComponent', () => {
  let component: SampleRfidComponent;
  let fixture: ComponentFixture<SampleRfidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleRfidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleRfidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

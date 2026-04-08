import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OCRComponent } from './ocr.component';

describe('OCRComponent', () => {
  let component: OCRComponent;
  let fixture: ComponentFixture<OCRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OCRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OCRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

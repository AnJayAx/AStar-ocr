import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearscanBtnComponent } from './clearscan-btn.component';

describe('ClearscanBtnComponent', () => {
  let component: ClearscanBtnComponent;
  let fixture: ComponentFixture<ClearscanBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClearscanBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearscanBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

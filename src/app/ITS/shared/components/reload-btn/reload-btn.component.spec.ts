import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadBtnComponent } from './reload-btn.component';

describe('ReloadBtnComponent', () => {
  let component: ReloadBtnComponent;
  let fixture: ComponentFixture<ReloadBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReloadBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReloadBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

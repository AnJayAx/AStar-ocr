import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrVerifyComponent } from './gr-verify.component';

describe('GrVerifyComponent', () => {
  let component: GrVerifyComponent;
  let fixture: ComponentFixture<GrVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrVerifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

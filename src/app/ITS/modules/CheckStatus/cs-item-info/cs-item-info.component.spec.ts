import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsItemInfoComponent } from './cs-item-info.component';

describe('CsItemInfoComponent', () => {
  let component: CsItemInfoComponent;
  let fixture: ComponentFixture<CsItemInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsItemInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsItemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

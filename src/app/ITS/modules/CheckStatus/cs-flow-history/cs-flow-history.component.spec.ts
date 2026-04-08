import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsFlowHistoryComponent } from './cs-flow-history.component';

describe('CsFlowHistoryComponent', () => {
  let component: CsFlowHistoryComponent;
  let fixture: ComponentFixture<CsFlowHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsFlowHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsFlowHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

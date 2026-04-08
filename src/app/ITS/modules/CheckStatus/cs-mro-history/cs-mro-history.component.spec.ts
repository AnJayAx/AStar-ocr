import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsMroHistoryComponent } from './cs-mro-history.component';

describe('CsMroHistoryComponent', () => {
  let component: CsMroHistoryComponent;
  let fixture: ComponentFixture<CsMroHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsMroHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsMroHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

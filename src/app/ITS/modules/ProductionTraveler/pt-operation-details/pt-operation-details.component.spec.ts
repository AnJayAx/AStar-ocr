import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtOperationDetailsComponent } from './pt-operation-details.component';

describe('PtOperationDetailsComponent', () => {
  let component: PtOperationDetailsComponent;
  let fixture: ComponentFixture<PtOperationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtOperationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtOperationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

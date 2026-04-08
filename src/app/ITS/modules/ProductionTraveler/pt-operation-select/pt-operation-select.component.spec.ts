import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtOperationSelectComponent } from './pt-operation-select.component';

describe('PtOperationSelectComponent', () => {
  let component: PtOperationSelectComponent;
  let fixture: ComponentFixture<PtOperationSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtOperationSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtOperationSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

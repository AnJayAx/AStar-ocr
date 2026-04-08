import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MroPartsListComponent } from './mro-parts-list.component';

describe('MroPartsListComponent', () => {
  let component: MroPartsListComponent;
  let fixture: ComponentFixture<MroPartsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MroPartsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MroPartsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

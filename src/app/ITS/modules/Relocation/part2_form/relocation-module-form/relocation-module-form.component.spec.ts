import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelocationModuleFormComponent } from './relocation-module-form.component';

describe('RelocationModuleFormComponent', () => {
  let component: RelocationModuleFormComponent;
  let fixture: ComponentFixture<RelocationModuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelocationModuleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelocationModuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

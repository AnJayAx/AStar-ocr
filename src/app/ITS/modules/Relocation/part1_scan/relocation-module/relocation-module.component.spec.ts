import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelocationModuleComponent } from './relocation-module.component';

describe('RelocationModuleComponent', () => {
  let component: RelocationModuleComponent;
  let fixture: ComponentFixture<RelocationModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelocationModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelocationModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

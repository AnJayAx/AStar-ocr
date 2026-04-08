import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditModuleComponent } from './audit-module.component';

describe('AuditModuleComponent', () => {
  let component: AuditModuleComponent;
  let fixture: ComponentFixture<AuditModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

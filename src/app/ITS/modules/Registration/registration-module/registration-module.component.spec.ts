import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationModuleComponent } from './registration-module.component';

import {MocksLocalService} from '@dis/services/mocks/mocks.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('RegistrationModuleComponent', () => {
  let component: RegistrationModuleComponent;
  let fixture: ComponentFixture<RegistrationModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MocksLocalService, TranslateService],
      declarations: [ RegistrationModuleComponent ],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

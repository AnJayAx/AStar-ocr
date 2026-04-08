import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsSettingsComponent } from './its-settings.component';

describe('ItsSettingsComponent', () => {
  let component: ItsSettingsComponent;
  let fixture: ComponentFixture<ItsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItsSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

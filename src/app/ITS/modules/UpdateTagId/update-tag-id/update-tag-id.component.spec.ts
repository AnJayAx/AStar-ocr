import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTagIdComponent } from './update-tag-id.component';

describe('UpdateTagIdComponent', () => {
  let component: UpdateTagIdComponent;
  let fixture: ComponentFixture<UpdateTagIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateTagIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTagIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

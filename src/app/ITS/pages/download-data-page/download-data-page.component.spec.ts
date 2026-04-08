import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDataPageComponent } from './download-data-page.component';

describe('DownloadDataPageComponent', () => {
  let component: DownloadDataPageComponent;
  let fixture: ComponentFixture<DownloadDataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadDataPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalMenuComponent } from './horizontal-menu.component';
import {Router} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {MenuService} from "@dis/services/menu/menu.service";
import {AuthGuard} from "@dis/auth/auth.guard";
import {KeycloakService} from "keycloak-angular";

describe('HorizontalMenuComponent', () => {
  let component: HorizontalMenuComponent;
  let keycloak: KeycloakService;
  let fixture: ComponentFixture<HorizontalMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MenuService, AuthGuard, KeycloakService],
      declarations: [ HorizontalMenuComponent ]
    })
    .compileComponents();

    keycloak = TestBed.inject(KeycloakService);
    spyOn(keycloak, 'getUserRoles').and.returnValue(['inventory_list', 'inventory_forecasting']);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

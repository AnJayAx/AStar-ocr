import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { AuthKeycloakService } from './auth-keycloak.service';
import { RoleTypes } from './roles.enum';
import { KeycloakLoginOptions } from 'keycloak-js';
import { environment } from 'src/environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {

  constructor(
    protected readonly router: Router,
    protected readonly keycloak: KeycloakService,
    protected readonly _authService: AuthKeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    console.log('check is access allowed');
    console.log("> authenticated: " + this.authenticated);
    if (!this.authenticated) {
      let loginOptions: KeycloakLoginOptions = {
        // redirectUri: environment.APP_ROOT + '/user'  // original code
        redirectUri: environment.APP_ROOT
      };
      await this.keycloak.login(loginOptions);
    }
    else {
      console.log(this.roles);
      const requiredRoles = route.data.elevation;
      if(!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
      else {
        for(const role of requiredRoles) {
          if(this.roles.indexOf(role) > -1) {
            return true;
          }
        }
        // below codes indicate the origin page
        /*
        if(this.roles.indexOf(RoleTypes.INVENTORY_PENDING) <= -1) {
          if(this.roles.indexOf(RoleTypes.INVENTORY_FORECASTING) > -1) {
            this.router.navigate(['user']);
          }
          else if(this.roles.indexOf(RoleTypes.INVENTORY_LIST) > -1) {
            this.router.navigate(['user-management'])
          }
          else if(this.roles.indexOf(RoleTypes.INVENTORY_PLANNING) > -1) {
            this.router.navigate(['admin']);
          }
          else this.router.navigate(['not-approved']);
        }
        else if(this.roles.indexOf(RoleTypes.INVENTORY_PENDING) > -1) {
          this.router.navigate(['not-approved']);
        }
        else {
          confirm(`Your are not approved to access this app yet, please contact the app-admin.`);
          this.keycloak.logout();
        }
        */
        return false;
      }
    }

    return this.authenticated;
  }

  async isAuthenticated(): Promise<boolean> {
    return this._authService.isLoggedIn();
  }

  isAuthorized(elevation: Array<RoleTypes>): boolean {
    if(elevation === null || elevation.length === 0) {
      return true;
    }
    const ExcludeRealmRoles = false;
    let currentRoles = this.keycloak.getUserRoles(ExcludeRealmRoles);
    console.log("Current user roles: \n" + currentRoles);
    for(const role of currentRoles) {
      if(elevation.includes(role as RoleTypes)) {
        return true;
      }
    }
    return false;
  }

  isApprovedUser() {
    let currentRoles = this.keycloak.getUserRoles();
    currentRoles.forEach(function (value) {
      console.log(value);
    });
    return ! (currentRoles.includes(RoleTypes.INVENTORY_PENDING) || 
      currentRoles === undefined || currentRoles.length === 0);
  }

}

import { Injectable} from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import {User} from '@dis/components/profile-menu/profile-menu.props';
import {RoleTypes} from '@dis/auth/roles.enum';
import {KeycloakInstance, KeycloakProfile} from 'keycloak-js';
import { environment } from 'src/environments/environment';

@Injectable()
export class MockedKeycloakService extends KeycloakService {

  constructor() { super(); }

  init(): Promise<any> {
    return Promise.resolve(true);
  }

  getKeycloakInstance(): KeycloakInstance{
    return {
      loadUserInfo: () => {
        let callback;
        Promise.resolve().then(() => {
          callback({
            userName: 'name'
          });
        });
        return {
          success: (fn) => callback = fn
        };
      }
    } as any;
  }

  // Hard-coded value as this is a mock class
  getUserDetails = async (): Promise<User> => {
      return Promise.resolve({
        id: '123123123',
        role: RoleTypes.ADMIN_INVENTORY,
        email: 'tester@gmail.com',
        contact: 'xxxxxxx'
      } as User);
  }



  isAllowedToAccess(): boolean {
    return true;
  }

  isLoggedIn(): Promise<any> {

    return  Promise.resolve(true);
  }

  loadUserProfile(): Promise<KeycloakProfile>{
    return  Promise.resolve(environment.DEV_TEST_USER as KeycloakProfile);
  }

  updateToken(minValidity?: number): Promise<boolean>{
    return  Promise.resolve(true);
  }

// Hard-coded value as this is a mock class
  getToken(): Promise<string>{
    return  Promise.resolve('development');
  }

  isUserInRole(role: string, resource?: string): boolean{
    return  true;
  }

  getUserRoles(allRoles?: boolean): string[] {
    return Object.values(RoleTypes);
  }

  getUsername(): string {
    return 'dev-user';
  }
}

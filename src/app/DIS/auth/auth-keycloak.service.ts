import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { User } from '../components/profile-menu/profile-menu.props';
import { RoleTypes } from './roles.enum';
import { ItsSettingsService } from '@its/shared/services/its-settings.service';
import { InitPageEventQueueService } from '@its/pages/init-page/init-page-event-queue.service';
import { InitPageEventType } from '@its/shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthKeycloakService {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private _itsSettings: ItsSettingsService,
    private eventQueue: InitPageEventQueueService,
  ) {}

  
  logout() {

    // this.router.navigate(['/logout']);

    // const loginURL = this._itsSettings.getKeycloakLoginUrl();
    // const logoutURL = this._itsSettings.getKeycloakLogoutUrl();

    // this.keycloakService.logout().then(() => {
    //   this.keycloakService.clearToken();
    //   window.location.reload();
    //   window.location.replace(logoutURL);

    //   // TODO: Navigate to keycloak login page
    // });

    // await this.keycloakService.logout().then(()=>{
    //   this.keycloakService.clearToken();


    // let mainURL = this.storage.getItem(Utils.PARAM_URL_KEYCLOAK_URL);
    // let port = this.storage.getItem(Utils.PARAM_URL_KEYCLOAK_PORT);
    // let realm = this.storage.getItem(Utils.PARAM_KEYCLOAK_REALM);
    // let client = this.storage.getItem(Utils.PARAM_KEYCLOAK_CLIENT);

    // let actualURL = environment.KEYCLOAK_URL;
    // let actualRealm = environment.KEYCLOAK_REALM;
    // let actualClient = environment.KEYCLOAK_CLIENT;
    // if ((mainURL !== null && mainURL !== '') && (port !== null && port !== '')) {
    //     actualURL = "http://"+mainURL +":" +port+"/realms/";
    //     // http://auth-server/realms/{realm-name}/protocol/openid-connect/logout
    // }

    // console.log("actual url:"+actualURL);
    // if ((realm !== null && realm !== '')) {
    //     actualRealm = realm;
    // }

    // if ((client !== null && client !== '')) {
    //     actualClient = client;
    // }

    //   this.router.navigateByUrl(actualURL+actualRealm+"/protocol/openid-connect/logout");
    // });
  }

  async isLoggedIn(): Promise<boolean> {
    // console.log("before");
    let isLogIn = await this.keycloakService.isLoggedIn();
    // console.log("after", isLogIn);
    return isLogIn;
  }

  getUserDetails = async(): Promise<User> => {
    if (await this.isLoggedIn()) {
      // console.log('get user details');
      let userDetails = await this.keycloakService.loadUserProfile(true);
      console.log('keycloak user profile', userDetails);

      this.keycloakService.getKeycloakInstance().subject;
      let token = await this.keycloakService.getToken();
      console.log('token', token);

      let userRole = this.keycloakService.isUserInRole(RoleTypes.LPT_INVENTORY_APP_ADMIN) ? 'Admin':
                    this.keycloakService.isUserInRole(RoleTypes.ROLE_MANAGER) ? 'User-Manager' :
                    this.keycloakService.isUserInRole(RoleTypes.LPT_INVENTORY_APP_USER) ? 'User' :
                    this.keycloakService.isUserInRole(RoleTypes.SPT_USER) ? 'User' :
                    'Pending';
      const user: User = {
        id: userDetails.id,
        username: userDetails.username,
        role: userRole,
        email: userDetails.email,
        contact: userDetails['attributes'] ?
          (userDetails['attributes'].mobile ? userDetails['attributes'].mobile[0] : '') : ''
      };
      return user;
    }
    else {
      console.log("Not Logged In !");
      return {} as User;
    }
  }

  isAllowedToAccess() {  //To judge if the current user has rights to access this project
    const excludeRealmRoles = false;

    // Map a emum obj into key-value array
    const roleTypesArray = Object.keys(RoleTypes).map(key => RoleTypes[key] );

    const currentRoles = this.keycloakService.getUserRoles(excludeRealmRoles);

    // Checks of currentRoles has value in roleTypesArray
    const isFounded = currentRoles.some( item => roleTypesArray.includes(item) );

    if (isFounded){
      return true;
    }
    return false;
  }

  updateToken(minValidity?: number): Promise<boolean>{
    let tokenUpdate = this.keycloakService.updateToken(minValidity);
    return tokenUpdate;
  }
}

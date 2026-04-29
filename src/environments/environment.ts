import { addonEnvironment } from '@dis/settings/environments/environment';
import { sharedVariables } from './shared.variables';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// git+https://github.com/joohong89/keycloak-js.git

const hostName = sharedVariables.hostName;
const keycloakUrl = sharedVariables.keycloakUrl;
// const KEYCLOAK_URL = keycloakUrl + ':8080/';
const KEYCLOAK_URL = keycloakUrl + ':8080';

export const environment = {
  isMobile: false,
  // production: true, // false is to use MockedKeycloakService, true is to use actual KeycloakService
  production: true,
  /** Optional: HTTP endpoint for VLM-based OCR (e.g., Qwen3-VL). Leave empty to use on-device ML Kit only. */
  DEV_TEST_USER: {
    id: 'Dev User 1',
    username: 'devuser1',
    email: 'devuser1@test.com',
    firstName: 'dev',
    lastName: 'user',
    enabled: true,
    emailVerified: true,
    totp: true
  },
  KEYCLOAK_URL: KEYCLOAK_URL,
  KEYCLOAK_REALM: 'demo1',
  KEYCLOAK_CLIENT: 'SPT_Inventory_Web', // Please add the client name(Id), 'INEVNTORY APP' is just a demo client name
  API_ROOT: '',                     // Please add your API Root
  APP_ROOT: hostName + ':4200',                     // Please add your APP Root
  ...addonEnvironment
  /*
  KEYCLOAK_REALM: 'demo1',
  KEYCLOAK_CLIENT: 'SPT_Inventory_Mobile', // Please add the client name(Id), 'INEVNTORY APP' is just a demo client name
  API_ROOT: '',                     // Please add your API Root
  APP_ROOT: hostName + ':4200',                     // Please add your APP Root
  KEYCLOAK_GET_CLIENT_ROLES_1: KEYCLOAK_URL + 'auth/admin/realms/demo1/users/',
  KEYCLOAK_GET_CLIENT_ROLES_2: '/role-mappings/clients/',
  KEYCLOAK_GET_CLIENT_ROLES_3: '/composite',
  ...addonEnvironment
  */
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

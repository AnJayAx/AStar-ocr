import { addonEnvironment } from '@dis/settings/environments/environment';
import { sharedVariables } from './shared.variables';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const hostName = sharedVariables.hostName;
const keycloakUrl = sharedVariables.keycloakUrl;
const keycloakPort = sharedVariables.keycloakPort;
const KEYCLOAK_URL = `http://${keycloakUrl}:${keycloakPort}/auth/`;

export const environment = {
  //baseAPIItemTracking: "http://10.0.0.10:3004/api",   
  baseAPIItemTracking: "http://10.100.124.52:3004/api",    
  
  //baseAPISPTDoc: "http://10.0.0.10:3005/api",        
  baseAPISPTDoc: "http://10.100.124.52:3005/api",          
  
  //customerApiBaseUrl: "http://10.0.0.10:3001/api",
  // customerApiBaseUrl: "http://10.100.124.52:5003/api",

  isMobile: true,
  production: true,
  // production: false, /* Set to false to disable KeyCloakService */

  /** Gemini Smart Suggester (VlmOcrService). Paste rotated key locally — DO NOT COMMIT. */
  GEMINI_API_KEY: 'AIzaSyDVTwATnxAozmSCUf70t7kF7LL6D0GSgHA',
  GEMINI_MODEL: 'gemini-2.5-flash-lite',
  /** Abort Gemini requests after this many ms (default is 3000). */
  GEMINI_LATENCY_BUDGET_MS: 6000,
  /** Keep small to reduce latency (default is 100). */
  GEMINI_MAX_OUTPUT_TOKENS: 80,
  /** If true, uses on-device ML Kit to auto-tighten the ROI crop before sending to Gemini (faster/smaller payload). */
  GEMINI_USE_MLKIT_AUTO_ROI: false,
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
  KEYCLOAK_CLIENT: 'LPT_Inventory_App',
  API_ROOT: '',                     
  APP_ROOT: hostName,                     
  KEYCLOAK_GET_CLIENT_ROLES_1: KEYCLOAK_URL + 'admin/realms/demo1/users/',
  KEYCLOAK_GET_CLIENT_ROLES_2: '/role-mappings/clients/',
  KEYCLOAK_GET_CLIENT_ROLES_3: '/composite',
  ...addonEnvironment

  /*
  KEYCLOAK_URL: KEYCLOAK_URL + 'auth',
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

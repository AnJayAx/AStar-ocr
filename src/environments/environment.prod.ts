import { addonEnvironment } from '@dis/settings/environments/environment.prod';
import { sharedVariables } from './shared.variables.prod';

const hostName = sharedVariables.hostName;
const keycloakUrl = sharedVariables.keycloakUrl;
const KEYCLOAK_URL = keycloakUrl + ':8080/';

export const environment = {
  isMobile: false,
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
  KEYCLOAK_URL: KEYCLOAK_URL + 'auth/',
  KEYCLOAK_REALM: 'demo1',
  KEYCLOAK_CLIENT: 'SPT_Inventory_Mobile', // Please add the client name(Id), 'INEVNTORY APP' is just a demo client name
  API_ROOT: '',                     // Please add your API Root
  APP_ROOT: hostName + '/',                     // Please add your APP Root
  KEYCLOAK_GET_CLIENT_ROLES_1: KEYCLOAK_URL + 'auth/admin/realms/demo1/users/',
  KEYCLOAK_GET_CLIENT_ROLES_2: '/role-mappings/clients/',
  KEYCLOAK_GET_CLIENT_ROLES_3: '/composite',
  ...addonEnvironment
};

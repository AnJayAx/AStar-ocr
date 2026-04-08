import { KeycloakService } from "keycloak-angular";
import { environment } from 'src/environments/environment';


//It is the keycloak initializer, should be configured in 'app.module.ts' file

export function initializeKeycloak(
    keycloak: KeycloakService
) {
    return () =>
        keycloak.init(
            {
                config: {
                    url: environment.KEYCLOAK_URL,
                    realm: environment.KEYCLOAK_REALM,
                    clientId: environment.KEYCLOAK_CLIENT,
                },
                loadUserProfileAtStartUp: true,
                enableBearerInterceptor: true,
                bearerPrefix: 'Bearer',
                initOptions: {
                    onLoad: 'login-required',
                    checkLoginIframe: false,
                    adapter: 'capacitor-native',
                    // adapter: 'capacitor',
                    // adapter: 'default',
                    // redirectUri: environment.APP_ROOT + '/#/mainmenunew'
                    redirectUri: environment.APP_ROOT
                },
            },
        )
        .then(success => {console.log(`keycloak init return ${success}`);})
        .catch(e => console.log(`keycloak init exception: ${e}`));
}

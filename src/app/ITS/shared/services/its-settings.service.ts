import { Injectable } from '@angular/core';
import { StorageService } from '@dis/services/storage/storage.service';
import { BehaviorSubject, Observable, filter, } from 'rxjs';
import { customerIPKey, customerPortKey, customerUrlKey, epcPrefixesEnabledKey, epcPrefixesKey, httpsOnlyKey, isDefaultUrlCustomKey, itemTrackingIPKey, itemTrackingPortKey, itemTrackingUrlKey, keycloakClientKey, keycloakIPKey, keycloakPortKey, keycloakRealmKey, keycloakUrlKey, keycloakUserIDKey, keycloakUsernameKey, sptDocIPKey, sptDocPortKey, sptDocUrlKey, defaultUrlKey } from '../constants/storagekeys.constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItsSettingsService {
  /* environment */
  private httpsOnlySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private defaultCustomUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');

  private itemTrackingIPSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private itemTrackingPortSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private itemTrackingCustomURLSubject: BehaviorSubject<string> = new BehaviorSubject('');
  
  private sptDocIPSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private sptDocPortSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private sptDocCustomUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');
  
  private customerIPSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private customerPortSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private customerCustomUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');

  private keycloakIPSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private keycloakPortSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private keycloakCustomUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private keycloakRealmSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private keycloakClientSubject: BehaviorSubject<string> = new BehaviorSubject('');

  private defaultCustomUrlEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // private sptDocCustomUrlEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // private customerCustomUrlEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // private keycloakCustomUrlEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /* app */
  private validEpcPrefixesSubject: BehaviorSubject<string[]>;
  private validEpcPrefixesEnabledSubject: BehaviorSubject<boolean>;

  /* for in-app use */
  public httpsOnly$: Observable<boolean> = this.httpsOnlySubject.asObservable();
  public defaultUrl$: Observable<string> = this.defaultCustomUrlSubject.asObservable();

  public itemTrackingIP$: Observable<string> = this.itemTrackingIPSubject.asObservable();
  public itemTrackingPort$: Observable<string> = this.itemTrackingPortSubject.asObservable();
  public itemTrackingUrl$: Observable<string> = this.itemTrackingCustomURLSubject.asObservable();
  public sptDocIP$: Observable<string> = this.sptDocIPSubject.asObservable();
  public sptDocPort$: Observable<string> = this.sptDocPortSubject.asObservable();
  public sptDocUrl$: Observable<string> = this.sptDocCustomUrlSubject.asObservable();
  public customerIP$: Observable<string> = this.customerIPSubject.asObservable();
  public customerPort$: Observable<string> = this.customerPortSubject.asObservable();
  public customerUrl$: Observable<string> = this.customerCustomUrlSubject.asObservable();
  public keycloakIP$: Observable<string> = this.keycloakIPSubject.asObservable();
  public keycloakPort$: Observable<string> = this.keycloakPortSubject.asObservable();
  public keycloakUrl$: Observable<string> = this.keycloakCustomUrlSubject.asObservable();
  public keycloakRealm$: Observable<string> = this.keycloakRealmSubject.asObservable();
  public keycloakClient$: Observable<string> = this.keycloakClientSubject.asObservable();

  public validEpcPrefixes$: Observable<string[]>;
  public validEpcPrefixesEnabled$: Observable<boolean>;

  public defaultCustomUrlEnabled$: Observable<boolean>;

  /* keycloak user info */
  private keycloakURLSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private keycloakUserIDSubject: BehaviorSubject<string> = new BehaviorSubject('');
  // private keycloakUsernameSubject: BehaviorSubject<string> = new BehaviorSubject('denise');   // FOR DEVELOPMENT USE ONLY
  private keycloakUsernameSubject: BehaviorSubject<string> = new BehaviorSubject('');

  public keycloakURL$: Observable<string> = this.keycloakURLSubject.asObservable();
  public keycloakUserID$: Observable<string> = this.keycloakClientSubject.asObservable();
  public keycloakUsername$: Observable<string> = this.keycloakUsernameSubject.asObservable().pipe(filter(username => username.length > 0));

  constructor(
    private _storage: StorageService,
  ) {
    /* initialize valid epc prefixes data without user action required */
    const storedEpcPrefixes = this._storage.isItemUndefined(this._storage.getItem(epcPrefixesKey)) ? null : this._storage.getItem(epcPrefixesKey);
    const epcPrefixesArr = !!storedEpcPrefixes ? storedEpcPrefixes.split(',').map(prefix => prefix.trim()) : [];
    this.validEpcPrefixesSubject = new BehaviorSubject(epcPrefixesArr);
    this.validEpcPrefixes$ = this.validEpcPrefixesSubject.asObservable();

    const storedEpcPrefixesEnabled = this._storage.isItemUndefined(this._storage.getItem(epcPrefixesEnabledKey)) ? false : this._storage.getStoredBoolean(this._storage.getItem(epcPrefixesEnabledKey));
    this.validEpcPrefixesEnabledSubject = new BehaviorSubject(storedEpcPrefixesEnabled);
    this.validEpcPrefixesEnabled$ = this.validEpcPrefixesEnabledSubject.asObservable();

    const storedDefaultCustomUrlEnabled = this._storage.isItemUndefined(this._storage.getItem(isDefaultUrlCustomKey)) ? false : this._storage.getStoredBoolean(this._storage.getItem(isDefaultUrlCustomKey));
    this.defaultCustomUrlEnabledSubject = new BehaviorSubject(storedDefaultCustomUrlEnabled);
    this.defaultCustomUrlEnabled$ = this.defaultCustomUrlEnabledSubject.asObservable();
  }

  urlsInitialized(): boolean {
    const isDefaultUrlCustom = this.defaultCustomUrlEnabledSubject.getValue();
    const itemTrackingIP = this._storage.getItem(itemTrackingIPKey);
    const itemTrackingPort = this._storage.getItem(itemTrackingPortKey);
    const itemTrackingUrl = this._storage.getItem(itemTrackingUrlKey);

    const sptDocIP = this._storage.getItem(sptDocIPKey);
    const sptDocPort = this._storage.getItem(sptDocPortKey);
    const sptDocUrl = this._storage.getItem(sptDocUrlKey);

    const itemTrackingEndpointInitialized = isDefaultUrlCustom ? this._storage.itemIsDefined(itemTrackingUrl) : (this._storage.itemIsDefined(itemTrackingIP) && this._storage.itemIsDefined(itemTrackingPort));
    const sptDocEndpointInitialized = isDefaultUrlCustom ? this._storage.itemIsDefined(sptDocUrl) : (this._storage.itemIsDefined(sptDocIP) && this._storage.itemIsDefined(sptDocPort));

    if (itemTrackingEndpointInitialized && sptDocEndpointInitialized) {
      console.log('IPs are initialized. continuing.');
    } else {
      console.log('IPs are NOT initialized.');
      console.log('itemTrackingEndpointInitialized', itemTrackingEndpointInitialized);
      console.log('sptDocEndpointInitialized', sptDocEndpointInitialized);
    }

    // console.log('> isItemTrackingUrlCustom', isItemTrackingUrlCustom);
    console.log('> item tracking IP', itemTrackingIP);
    console.log('> item tracking port', itemTrackingPort);
    console.log('> item tracking url', itemTrackingUrl);
    console.log('> sptdoc ip', sptDocIP);
    console.log('> sptdoc port', sptDocPort);
    console.log('> sptDoc url', sptDocUrl);

    return (itemTrackingEndpointInitialized && sptDocEndpointInitialized);
  }

  keycloakInitialized(): boolean {
    const isKeycloakUrlCustom = this.defaultCustomUrlEnabledSubject.getValue();
    const keycloakIP = this._storage.getItem(keycloakIPKey);
    const keycloakPort = this._storage.getItem(keycloakPortKey);
    const keycloakUrl = this._storage.getItem(keycloakUrlKey);
    const keycloakClient = this._storage.getItem(keycloakClientKey);
    const keycloakRealm = this._storage.getItem(keycloakRealmKey);

    const keycloakEndpointInitialized = isKeycloakUrlCustom ? this._storage.itemIsDefined(keycloakUrl) : this._storage.itemIsDefined(keycloakIP) && this._storage.itemIsDefined(keycloakPort);
    const keycloakSettingsInitialized = this._storage.itemIsDefined(keycloakClient) && this._storage.itemIsDefined(keycloakRealm);

    if (keycloakEndpointInitialized && keycloakSettingsInitialized) {
      console.log('Keycloak params initialized');
      console.log('> keycloak ip', keycloakIP);
      console.log('> keycloak port', keycloakPort);
      console.log('> keycloak url', keycloakUrl);
      console.log('> keycloak client', keycloakClient);
      console.log('> keycloak realm', keycloakRealm);
    }

    return (keycloakEndpointInitialized && keycloakSettingsInitialized);
  }

  setEpcPrefixes(prefixes: string) {
    this._storage.setItem(epcPrefixesKey, prefixes);
    const prefixesArr = prefixes.split(',');
    this.validEpcPrefixesSubject.next(prefixesArr);
  }

  getCurrentEpcPrefixes(): string[] {
    return this.validEpcPrefixesSubject.value;
  }

  setEpcPrefixesEnabled(enabled: boolean) {
    this._storage.setItem(epcPrefixesEnabledKey, enabled.toString());
    this.validEpcPrefixesEnabledSubject.next(enabled);
  }

  getCurrentEpcPrefixesEnabled(): boolean {
    return this.validEpcPrefixesEnabledSubject.value;
  }
 
  setHttpsOnly(isHttpsOnly: boolean) {
    this._storage.setItem(httpsOnlyKey, isHttpsOnly.toString());
    this.httpsOnlySubject.next(isHttpsOnly);
  }

  getCurrentHttpsOnly(): boolean {
    return this.httpsOnlySubject.getValue()
  }

  setDefaultCustomUrlEnabled(enabled: boolean) {
    this._storage.setItem(isDefaultUrlCustomKey, enabled.toString());
    this.defaultCustomUrlEnabledSubject.next(enabled);
  }

  getDefaultCustomUrlEnabled(): boolean {
    return this.defaultCustomUrlEnabledSubject.getValue();
  }

  setDefaultUrl(url: string) {
    this._storage.setItem(defaultUrlKey, url);
    this.itemTrackingCustomURLSubject.next(url);
  }

  setItemTrackingIP(ipAddress: string) {
    this._storage.setItem(itemTrackingIPKey, ipAddress);
    this.itemTrackingIPSubject.next(ipAddress);
  }

  setItemTrackingPort(portNumber: string) {
    this._storage.setItem(itemTrackingPortKey, portNumber);
    this.itemTrackingPortSubject.next(portNumber);
  }

  setItemTrackingUrl(url: string) {
    this._storage.setItem(itemTrackingUrlKey, url);
    this.itemTrackingCustomURLSubject.next(url);
  }

  setSptDocIP(ipAddress: string) {
    this._storage.setItem(sptDocIPKey, ipAddress);
    this.sptDocIPSubject.next(ipAddress);
  }

  setSptDocPort(portNumber: string) {
    this._storage.setItem(sptDocPortKey, portNumber);
    this.sptDocPortSubject.next(portNumber);
  }

  setSptDocUrl(url: string) {
    this._storage.setItem(sptDocUrlKey, url);
    this.sptDocCustomUrlSubject.next(url);
  }

  setCustomerIP(ipAddress: string) {
    this._storage.setItem(customerIPKey, ipAddress);
    this.customerIPSubject.next(ipAddress);
  }

  setCustomerPort(portNumber: string) {
    this._storage.setItem(customerPortKey, portNumber);
    this.customerPortSubject.next(portNumber);
  }

  setCustomerUrl(url: string) {
    this._storage.setItem(customerUrlKey, url);
    this.customerCustomUrlSubject.next(url);
  }

  setKeycloakIP(ipAddress: string) {
    this._storage.setItem(keycloakIPKey, ipAddress);
    this.keycloakIPSubject.next(ipAddress);
  }

  setKeycloakPort(portNumber: string) {
    this._storage.setItem(keycloakPortKey, portNumber);
    this.keycloakPortSubject.next(portNumber);
  }

  setKeyCloakUrl(url: string) {
    this._storage.setItem(keycloakUrlKey, url);
    this.keycloakCustomUrlSubject.next(url);
  }

  setKeycloakRealm(realm: string) {
    this._storage.setItem(keycloakRealmKey, realm);
    this.keycloakRealmSubject.next(realm);
  }

  setKeycloakClient(client: string) {
    this._storage.setItem(keycloakClientKey, client);
    this.keycloakClientSubject.next(client);
  }

  setKeycloakUserId(id: string) {
    this._storage.setItem(keycloakUserIDKey, id);
    this.keycloakUserIDSubject.next(id);
  }

  setKeycloakUsername(name: string) {
    this._storage.setItem(keycloakUsernameKey, name);
    this.keycloakUsernameSubject.next(name);
  }

  getCurrentKeycloakUsername(): string {
    return this.keycloakUsernameSubject.getValue();
  }

  getKeycloakLoginUrl(): string {
    let url = "";

    const httpsOnly = this._storage.getStoredBoolean(this._storage.getItem(httpsOnlyKey));
    const httpsPrefix = httpsOnly ? 'https' : 'http';
    const ip = this._storage.getItem(keycloakIPKey);
    const port = this._storage.getItem(keycloakPortKey);

    if (this._storage.itemIsDefined(ip) && this._storage.itemIsDefined(port)) {
     url =  `${httpsPrefix}://${ip}:${port}/auth/`;
    } else {
      url = environment.KEYCLOAK_URL;
    }
    return url;
  }

  getKeycloakLogoutUrl(): string {
    let url = "";

    const httpsOnly = this._storage.getStoredBoolean(this._storage.getItem(httpsOnlyKey));
    const httpsPrefix = httpsOnly ? 'https' : 'http';
    const ip = this._storage.getItem(keycloakIPKey);
    const port = this._storage.getItem(keycloakPortKey);
    const storedRealm = this._storage.getItem(keycloakRealmKey);
    const realm = this._storage.itemIsDefined(storedRealm) ? storedRealm : environment.KEYCLOAK_REALM;
    const loginURL = this.getKeycloakLoginUrl();
    const client = this.keycloakClientSubject.getValue();

    const isKcCustomUrlEnabled = this._storage.getStoredBoolean(this._storage.getItem(isDefaultUrlCustomKey));
    const kcCustomUrl = this._storage.getItem(keycloakUrlKey);

    const logoutSuffix = `realms/${realm}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(environment.APP_ROOT)}&client_id=${client}`;
    if (this._storage.itemIsDefined(ip) && this._storage.itemIsDefined(port) && !isKcCustomUrlEnabled) {
      url = `${httpsPrefix}://${ip}:${port}/auth/${logoutSuffix}`;
    } else if (this._storage.itemIsDefined(kcCustomUrl) && isKcCustomUrlEnabled) {
      url = `${kcCustomUrl}/auth/${logoutSuffix}`;
    } else {
      url = `${environment.KEYCLOAK_URL}/realms/${logoutSuffix}`;
    }

    return url;
  }
}

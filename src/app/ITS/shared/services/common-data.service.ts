import { Injectable } from '@angular/core';
import { ItsServiceService } from './its-service.service';
import { Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import { IGeolocationCoords } from '../interfaces/plugins/GeolocationCoords';
import { Geolocation, GeolocationPluginPermissions } from '@capacitor/geolocation';
import { IUser } from '../interfaces/backend/User';
import { ItsSettingsService } from './its-settings.service';
import { INBOUND_VERIFY_STATUS_KEY, INBOUND_VERIFY_VALUE_KEY, IS_CONNECT_BLOCKCHAIN_KEY, LOAN_DURATION_KEY } from '../constants/lptkeys.constants';
import { ICompany } from '../interfaces/backend/Customer/Company';
import { ILatLong } from '../interfaces/frontend/LatLong';
import { ToastService } from '@dis/services/message/toast.service';
import { RefreshService } from './refresh.service';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';


@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  blockchainConnectionEnabled$: Observable<boolean> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getLPTValueByKey(IS_CONNECT_BLOCKCHAIN_KEY)),
    map(yesnoStr => yesnoStr.toLowerCase() === 'no' ? false : true)
  );

  inboundVerifyStatus$: Observable<string> = this._refresh.refreshToken$.pipe(switchMap(() => this._itsService.getLPTValueByKey(INBOUND_VERIFY_STATUS_KEY)));
  inboundVerifyValue$: Observable<string> = this._refresh.refreshToken$.pipe(switchMap(() => this._itsService.getLPTValueByKey(INBOUND_VERIFY_VALUE_KEY)));

  loanDurationInMonths$: Observable<number> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getLPTValueByKey(LOAN_DURATION_KEY)),
    map(durationStr => parseInt(durationStr))
  );

  validCategoryNames$: Observable<string[]> = this._refresh.refreshToken$.pipe(
    switchMap(() => this._itsService.getAssignedUserCategoriesByUserName()),
    map(categoryObjArr => { return categoryObjArr.map(categoryObj => categoryObj.Name);})
  );

  currentGeoPosition$: Observable<IGeolocationCoords> =
    this._refresh.refreshToken$.pipe(
      switchMap(() => from(Geolocation.getCurrentPosition())),
      tap(position => console.log('[common-data svc] geolocation.getCurrentPosition()', position)),
      map(position => position.coords),
      tap(position => console.log('[common-data svc] currentGeoPosition$ position', position))
    );

  currentLatLong$: Observable<ILatLong> = this.currentGeoPosition$.pipe(
    map(geolocationCoords => { return { "Latitude": geolocationCoords.latitude, "Longitude": geolocationCoords.longitude }; }),
    catchError(error => {
      this._toast.error('Unable to retrieve geolocation coordinates. Ensure that location is turned on.');
      console.error(error);
      return of(null);
    })
  );

  serverUser$: Observable<IUser> = this._itssettingsService.keycloakUsername$.pipe(
    switchMap(username => this._itsService.getUserIDByUsername(username)),
    switchMap(userid => this._itsService.getUserByUserId(userid)),
    tap(user => console.log('[common-data svc] serverUser$', user))
  );

  userCompany$: Observable<ICompany> = this.serverUser$.pipe(
    map(userObject => userObject.CompanyID),
    switchMap(companyId => this._itsService.getCompanyByCompanyId(parseInt(companyId))),
    tap(company => console.log('[common-data svc] userCompany$', company))
  );

  constructor(
    private _itsService: ItsServiceService,
    private _itssettingsService: ItsSettingsService,
    private _toast: ToastService,
    private _refresh: RefreshService,
    private _customdialog: CustomDialogService
  ) {

    // this.requestLocationPermission();
    // this.requestLocationPermission()
  }
}

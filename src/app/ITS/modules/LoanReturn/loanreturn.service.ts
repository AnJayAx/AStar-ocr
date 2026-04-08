import { Injectable } from '@angular/core';
import { ILoanReturnItem } from '@its/shared/interfaces/frontend/loanReturnItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { Observable, concatMap, map, of, switchMap, tap } from 'rxjs';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { Utils } from '@its/shared/classes/utils';
import { ICustomerAddress } from '@its/shared/interfaces/backend/Customer/CustomerAddress';
import { CommonStoreService } from '@its/shared/services/common-store.service';

export interface ICustomerDetails {
  name: string;
  assetLocationId: number;
  address: ICustomerAddress;
}

@Injectable()
export class LoanreturnService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _customdialog: CustomDialogService,
    private _tagsService: ScannedTagsService,
    private _commondataService: CommonDataService,
    private _blockchainService: BlockchainService,
    private _commonstoreService: CommonStoreService,
  ) {}

  containsSAvailableItem(tagItems: ISelectedTag[]): boolean {
    let returnBool = false;
    tagItems.every(tagItem => {
      if (tagItem.SM.toLowerCase() === 's' && tagItem.Asset_StatusName.toLowerCase() === 'available') {
        returnBool = true;
        return;
      }
    });
    console.log('containsSAvailableItems tagItems', tagItems);
    console.log('returnBool', returnBool);
    return returnBool;
  }

  containsLoan(tagItems: ISelectedTag[]): boolean {
    let returnBool = false;
    tagItems.every(tagItem => {
      if (tagItem.Asset_StatusName.toLowerCase().replace(' ','') === 'onloan') {
        returnBool = true;
        return;
      }
    });
    console.log('containsLoan tagItems', tagItems);
    console.log('returnBool', returnBool);
    return returnBool;
  }

  missingSelectionDialog(): Observable<any> {
    return this._customdialog.message(
      'Missing Selection',
      'Please select a "Return" or "Loan" option',
      [{ text: 'Close', primary: false }], 'error'
    );
  }

  returnAvailableDialog(): Observable<any> {
    return this._customdialog.message(
      'Item Error', 'Unable to return "Available" items.',
      [{ text: 'Close', primary: false }], 'error'
    );
  }

  loanOnLoanDialog(): Observable<any> {
    return this._customdialog.message(
      'Item Error', 'Unable to loan "On Loan" items.',
      [{ text: 'Close', primary: false }], 'error'
    );
  }
  getCustomerAddressByAddressId$(locationAddressId: string): Observable<ICustomerAddress> {
    return this._itsService.getCustomerAddressByCustomerAddressId(locationAddressId);
  }
  
  postLoan(loanItems: ILoanReturnItem[], newLocationId: number): Observable<any> {
    return this._itsService.postLoan(loanItems, newLocationId).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postLoanToServerAndBlockchain(loanScanItems: IItemInfo[], loanPostItems: ILoanReturnItem[], loanCustomer: ICustomerDetails, leaseEndDate: Date): Observable<any> {
    /* set expiry date fields for loan scan items */
    loanScanItems.forEach(item => {
      item.Date_of_Expire = leaseEndDate.toDateString();
      item.Date_of_ExpireS = Utils.formatDateString(item.Date_of_Expire);
    });

    const postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getLoanDestinationPostBlock(loanPostItems[0].DocumentNo, loanScanItems, {loanCustomerName: loanCustomer.name, loanCustomerAddress: loanCustomer.address}, loanPostItems[0].Remarks, latlong.Latitude, latlong.Longitude))),
      concatMap(res => this._itsdialog.postByHH(res))
    );

    return this.postLoan(loanPostItems, loanCustomer.assetLocationId).pipe(
      tap(response => console.log('[loanreturn svc] Post loan to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse); })
    )
  }

  postReturn(returnItems: ILoanReturnItem[], newLocationId: number): Observable<any> {
    return this._itsService.postReturn(returnItems, newLocationId).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postReturnToServerAndBlockchain(returnScanItems: IItemInfo[], returnPostItems: ILoanReturnItem[], returnLocation: ILocations, customerDetails: ICustomerDetails): Observable<any> {
    /* clear expiry date fields for return scan items */
    returnScanItems.forEach(item => item.Date_of_Expire = item.Date_of_ExpireS = item.Warranty_Expiry_Date = "");

    const postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getReturnDestinationPostBlock(returnPostItems[0].DocumentNo, returnScanItems, returnLocation, returnPostItems[0].Remarks, latlong.Latitude, latlong.Longitude))),
      concatMap(res => this._itsdialog.postByHH(res))
    );

    return this.postReturn(returnPostItems, customerDetails.assetLocationId).pipe(
      tap(response => console.log('[loanreturn svc] Post return to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse); })
    )
  }

  clearTags() {
    this._tagsService.resetTagsService();
  }
}

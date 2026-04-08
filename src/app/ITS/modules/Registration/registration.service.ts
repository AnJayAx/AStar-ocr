import { Injectable } from '@angular/core';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { IInboundItem } from '@its/shared/interfaces/backend/InboundItem';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IPostByHHResponse } from '@its/shared/interfaces/backend/PostByHHResponse';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable()
export class RegistrationService {

  inboundVerifyValue: string = this._commonstoreService.currentInboundVerifyValue;

  constructor(
    private _itsService: ItsServiceService,
    private _customDialog: CustomDialogService,
    private _tagsService: ScannedTagsService,
    private _commonstoreService: CommonStoreService,
    private _commondataService: CommonDataService,
    private _blockchainService: BlockchainService,
    private _itsdialog: ItsDialogService,
  ) {}
  
  registerItem(urlDocNo: string, registerItems: IInboundItem[]): Observable<any> {
    const successDialog = this._customDialog.message('Registration Successful', 'Your item(s) has been registered!',
      [{ text: 'Done', primary: true }], 'success'); 
    
    const failedDialog = (response: IPostByHHResponse) => {
      return this._customDialog.messageHTML(
        `Registration Failed`, response['Message'],
        [{ text: 'Close', primary: false }], 'error');
    };

    console.log('[registration service] registerItem > urlDocNo', urlDocNo);
    console.log('[registration service] registerItem > registerItems', registerItems);
    return this._itsService.registerItem(urlDocNo, registerItems).pipe(
      switchMap(
        res => res['Status'].toLowerCase() === 'success' ?
        successDialog :
        failedDialog(res)
      ),
      catchError(error => failedDialog(error))
    );
  }

  postRegisterToServerAndBlockchain(urlDocNo: string, registerItems: IInboundItem[], registerScanItems: IItemInfo[]): Observable<any> {
    const postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getRegistrationPostBlock(urlDocNo, registerScanItems, latlong.Latitude, latlong.Longitude))),
      tap(res => console.log(`[registration svc] Post registration to blockchain`, res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    return this.registerItem(urlDocNo, registerItems).pipe(
      tap(response => console.log('[registration service] Post registration to server', response)),
      switchMap(dialogResponse => { 
        return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$: of(dialogResponse);
      })
    );
  }

  incomingScanItems(): Observable<string[]> {
    return this._tagsService.scannedTags$.pipe(
      map(tags => [...new Set(tags)])
    );
  }

  onScannedTagsUpdated(updatedScanTags: string[]) {
    this._tagsService.updateScannedTags(updatedScanTags);
  }

  clearScannedTags(): void {
    this._tagsService.resetTagsService();
  }

  getVerifyValueFromToggle(isToggled: boolean): string {
    return isToggled ? this._commonstoreService.currentInboundVerifyValue : 'Non';
  }
}

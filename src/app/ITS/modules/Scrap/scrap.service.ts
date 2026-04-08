import { Injectable } from '@angular/core';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IScrapItem } from '@its/shared/interfaces/frontend/scrapItem';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, of, switchMap, tap } from 'rxjs';

@Injectable()
export class ScrapService {

  constructor(
    private _itsService: ItsServiceService,
    private _customDialog: CustomDialogService,
    private _tagsService: ScannedTagsService,
    private _blockchainService: BlockchainService,
    private _commondataService: CommonDataService,
    private _itsdialog: ItsDialogService,
    private _commonstoreService: CommonStoreService
  ) { }

  postScrap(scrapItems: IScrapItem[]): Observable<any> {
    const successDialog = this._customDialog.message('Scrap Successful', 'Your item(s) have been scrapped!',
      [{ text: 'Done', primary: true }], 'success');

    const failedDialog = this._customDialog.message('Scrap Failed', 'Item(s) failed to be scrapped.',
    [{ text: 'Close', primary: true }], 'error');

    return this._itsService.postScrap(scrapItems).pipe(
      tap(response => console.log('postScrap', response)),
      switchMap(
        response => response['Status'].toLowerCase() === 'success' ?
        successDialog :
        failedDialog
      )
    );
  }

  postScrapToServerAndBlockchain(scrapScanItems: IItemInfo[], remarks: string): Observable<any> {
    const postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getScrapPostBlock(scrapScanItems, latlong.Latitude, latlong.Longitude, remarks))),
      tap(res => console.log('[scrap svc] Post scrap to blockchain', res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    const scrapItems: IScrapItem[] = scrapScanItems.map(item => {
      return {
        "EPC_ID": item.EPC_ID,
        "Qty": item.LastBal.toString(),
        "userid": this._itsService.getKeyCloakUsername(),
        "Remarks": remarks
      } as IScrapItem
    });
    
    return this.postScrap(scrapItems).pipe(
      tap(response => console.log('[scrap svc] Post scrap to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true? postToBlockchain$ : of(dialogResponse) })
    );
  }

  clearTags() {
    this._tagsService.resetTagsService();
  }
}

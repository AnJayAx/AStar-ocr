import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IMRORecord } from '@its/shared/interfaces/frontend/MROItem';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, of, switchMap, tap } from 'rxjs';

export interface IMroState {
  retrievedTags: ISelectedTag[];
  mroFormValues: { [controlName: string]: string };
}
@Injectable()
export class MroService {

  private initialMroState: IMroState = null;

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService,
    private _commondataService: CommonDataService,
    private _blockchainService: BlockchainService,
    private _commonstoreService: CommonStoreService,
  ) { }

  postMROs(mroRecords: IMRORecord[]): Observable<any> {
    return this._itsService.postMROs(mroRecords).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  updateMROs(mroRecords: IMRORecord[], asset_MRO_History_ID : string ): Observable<any> {
    return this._itsService.putMROs(mroRecords,asset_MRO_History_ID).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postMROToServerAndBlockchain(docNo: string, mroPostItems: IMRORecord[], mroScanItems: IItemInfo[], mroRemarks: string): Observable<any> {
    const postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getMroPostBlock(mroScanItems, docNo, mroRemarks, latlong.Latitude, latlong.Longitude))),
      tap(res => console.log(`[mro svc] Post MRO to blockchain`, res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    return this.postMROs(mroPostItems).pipe(
      tap(response => console.log('[mro svc] Post MRO to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse) })
    );
  }


  postMROToServerAndBlockchainWithDraft(docNo: string, mroPostItems: IMRORecord[], mroScanItems: IItemInfo[], mroRemarks: string, isDraft: boolean): Observable<any> {
    let postToBlockchain$;
    if (!isDraft) {
      postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
        switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getMroPostBlock(mroScanItems, docNo, mroRemarks, latlong.Latitude, latlong.Longitude))),
        tap(res => console.log(`[mro svc] Post MRO to blockchain`, res)),
        switchMap(res => this._itsdialog.postByHH(res))
      );
    }
    return this.postMROs(mroPostItems).pipe(
      tap(response => console.log('[mro svc] Post MRO to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse) })
    );
  }

  updateMROToServerAndBlockchainWithDraft(docNo: string, mroPostItems: IMRORecord[], mroScanItems: IItemInfo[], mroRemarks: string, asset_MRO_History_ID : string): Observable<any> {
   
    let postToBlockchain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getMroPostBlock(mroScanItems, docNo, mroRemarks, latlong.Latitude, latlong.Longitude))),
      tap(res => console.log(`[mro svc] Post MRO to blockchain`, res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );
    
    return  this.updateMROs(mroPostItems, asset_MRO_History_ID).pipe(
      tap(response => console.log('[mro svc] UPDATE MRO to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse) })
      );
  }

  
  UpdateMROToServerWithDraft(mroPostItems: IMRORecord[], asset_MRO_History_ID : string): Observable<any> {

    return this.updateMROs(mroPostItems, asset_MRO_History_ID).pipe(
      tap(response => console.log('[mro svc] UPDATE MRO to server', response)),
      switchMap(res => this._itsdialog.postByHH(res))
    );
  }

  clearTags() {
    this._tagsService.resetTagsService();
  }

  setInitialMroState(mroStateInput: IMroState): void { this.initialMroState = mroStateInput; console.log('DEBUG initialmrostate', this.initialMroState); }
  getInitialMroState(): IMroState { return this.initialMroState; }

}

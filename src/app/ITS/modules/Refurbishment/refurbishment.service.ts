import { Injectable } from '@angular/core';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IRefurbishment } from '@its/shared/interfaces/backend/Refurbishment';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefurbishmentService {

  private postRefurbishment(passFail: 'pass'|'fail', refurbishOption: string, refurbishScanItems: IItemInfo[], refurbishRemarks: string) {
    const postRefurbishment: IRefurbishment = {
      "Status": passFail === 'pass' ? "Pass" : "Not Pass",
      "MRO_Description": refurbishRemarks,
      "Refurbish_Operation": refurbishOption,
      "EPCIDS": refurbishScanItems.map(item => { return { "EPC_ID": item.EPC_ID } as IEpcId}),
    };
    console.log('[rb service] postRefurbishment param', postRefurbishment);
    return this._itsService.postRefurbishment(postRefurbishment).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postRefurbishmentToServerAndBlockchain(passFail: 'pass'|'fail', refurbishOption: string, refurbishScanItems: IItemInfo[], refurbishRemarks: string): Observable<any> {
    const postToBlockChain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getRefurbishmentPostBlock(refurbishScanItems, refurbishOption, passFail.toString(), refurbishRemarks, latlong.Latitude, latlong.Longitude))),
      tap(res => console.log('[rb service] Post refurbishment to blockchain', res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    return this.postRefurbishment(passFail, refurbishOption, refurbishScanItems, refurbishRemarks).pipe(
      tap(response => console.log('[rb service] Post refurbishment to server', response)),
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockChain$ : of(dialogResponse) })
    );
  }

  clearTags() {
    this._tagsService.resetTagsService();
  }

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagsService: ScannedTagsService,
    private _blockchainService: BlockchainService,
    private _commondataService: CommonDataService,
    private _commonstoreService: CommonStoreService
  ) { }
}

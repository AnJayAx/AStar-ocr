import { Injectable } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IVerifyPassHH } from '@its/shared/interfaces/backend/VerifyPassHH';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, filter, map, of, switchMap, tap } from 'rxjs';
import { SearchKeyType } from '../gr-verify.constants';
import { CommonStoreService } from '@its/shared/services/common-store.service';

const SEARCHKEY_PROPERTY_DICTIONARY: { key: SearchKeyType, propertyName: string }[] = [
  { key: SearchKeyType.BatchNo, propertyName: 'BatchNo' },
  { key: SearchKeyType.RefNo, propertyName: 'Ref_No' },
];

@Injectable({
  providedIn: 'root'
})
export class GrVerifyService {

  private getSearchKeyPropertyName(searchKey: SearchKeyType): string {
    return SEARCHKEY_PROPERTY_DICTIONARY.find(entry => entry.key===searchKey).propertyName;
  }

  inboundVerifyStatus: string;

  grVerifyScannedItemSearchKeyValue$(enableErrorMsg: boolean=false, searchKey: SearchKeyType): Observable<string> {
    let scannedTag;
    return this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      map(tags => tags[tags.length - 1]), /* Use last tag in array if there are multiple tags -- RANDOM CHOICE */
      tap(tag => scannedTag = tag),
      map(tag => { return [{"EPC_ID": tag}] as IEpcId[]; }),
      switchMap(epcTag => this._itsService.postItemsByEpcId(epcTag)),
      tap(itemArr => console.log('[gr-verify service] grVerifyScannedItemBatchNo$ itemArr', itemArr)),
      filter(itemArr => itemArr.length > 0),
      map(itemArr => itemArr[0][this.getSearchKeyPropertyName(searchKey)]),  /* use first item's batch no. or ref. no. -- RANDOM CHOICE */ 
      tap(propertyValue => {
        if ((!propertyValue || propertyValue.length === 0) && enableErrorMsg) { 
          this._toast.warning(`Unable to find ${searchKey} for tag ID: ${scannedTag}`); 
        }
      })
    );
  }

  constructor(
    private _tagsService: ScannedTagsService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _blockchainService: BlockchainService,
    private _commondataService: CommonDataService,
    private _toast: ToastService,
    private _commonstoreService: CommonStoreService,
  ) {
    this._commondataService.inboundVerifyStatus$.subscribe({
      next: status => {
        this.inboundVerifyStatus = status
      }
    });
  }

  grVerifyScannedItemTagIds$(): Observable<string[]> {
    return this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      tap(tags => console.log('[gr-verify service] incoming tags', tags)),
      switchMap(epcTags => {
        const epcParams = epcTags.map(tag => { return {"EPC_ID": tag } as IEpcId });
        return this._itsService.postItemsByEpcId(epcParams);
      }),
      tap(itemArr => console.log('[gr-verify service] postItemsByEpcId', itemArr)),
      filter(itemArr => itemArr.length > 0),
      map(itemArr => itemArr.map(item => item.EPC_ID))
    );
  }

  getGrVerifyItemsBySearchKey$(keyword: string, searchKeyType: SearchKeyType): Observable<IItemInfo[]> {
    return this._commondataService.inboundVerifyStatus$.pipe(
      tap(inboundKey => console.log('[gr-verify service] inboundVerifyStatus', inboundKey)),
      filter(statusValue => statusValue?.length > 0), /* inbound verify status needs to be defined in order to conduct GR Verify */
      tap(searchKeyType => console.log('[gr-verify] search key type', searchKeyType)),
      switchMap(inboundKey => searchKeyType === SearchKeyType.BatchNo ? this._itsService.getGrItemInfoByBatchNoAndStatus(keyword, inboundKey) : this._itsService.getGrItemInfoByRefNoAndStatus(keyword, inboundKey))
    );
  }

  postGRVerifyItems(itemInfoArr: IItemInfo[]): Observable<any> {
    const username = this._itsService.getKeyCloakUsername();
    const postItemParam: IVerifyPassHH[] = itemInfoArr.map(item => { return {
      "EPC_ID": item.EPC_ID,
      "Qty": item.LastBal.toString(),
      "Remarks": item.Remarks,
      "DocNo": "",
      "userid": username,
      "ST_Status": item.Asset_StatusName,
      "needsUpdateLocation": "",
      "selectedLocationID": "",
    }; })
    return this._itsService.postGRVerifyHH(postItemParam).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }
  
  postGRVerifyItemsToServerAndBlockchain(itemInfoArr: IItemInfo[]): Observable<any> {
    const username = this._itsService.getKeyCloakUsername();
    const postItemParam: IVerifyPassHH[] = itemInfoArr.map(item => { return {
      "EPC_ID": item.EPC_ID,
      "Qty": item.LastBal.toString(),
      "Remarks": item.Remarks,
      "DocNo": "",
      "userid": username,
      "ST_Status": item.Asset_StatusName,
      "needsUpdateLocation": "",
      "selectedLocationID": "",
    }; });

    const postToBlockChain$ = this._commondataService.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getGrVerifyPostBlock(itemInfoArr, latlong.Latitude, latlong.Longitude))),
      tap(res => console.log('[gr-verify service] Post GR Verify to blockchain', res)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    return this._itsService.postGRVerifyHH(postItemParam).pipe(
      tap(response => console.log('[gr-verify service] Post GR Verify to server', response)),
      switchMap(response => this._itsdialog.postByHH(response)),
      switchMap(dialogResponse => { return dialogResponse.primary && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockChain$ : of(dialogResponse) })
    );
  }
}

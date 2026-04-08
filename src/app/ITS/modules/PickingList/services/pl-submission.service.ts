import { Injectable } from '@angular/core';
import { IPickedItemByHHLite } from '@its/shared/interfaces/backend/SPT_Doc/PickedItemByHH';
import { IPLTagItem } from '@its/shared/interfaces/frontend/PLTagItem';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { BehaviorSubject, combineLatest, concatMap, filter, map, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { PlSelectedOrderService } from './pl-selected-order.service';
import { PICK_N_PACK_KEY } from '@its/shared/constants/lptkeys.constants';
import { IPackageMaster } from '@its/shared/interfaces/backend/SPT_Doc/PackageMaster';
import { RefreshService } from '@its/shared/services/refresh.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { PlResetService } from './pl-reset.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';

@Injectable({
  providedIn: 'root'
})
export class PlSubmissionService {
  private plSubmissionSubject: BehaviorSubject<IPickedItemByHHLite[]> = new BehaviorSubject([]);
  public plSubmission$: Observable<IPickedItemByHHLite[]> = this.plSubmissionSubject.asObservable();

  private isPickAndPackSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isPickAndPack$: Observable<boolean> = this.isPickAndPackSubject.asObservable();
  
  private mQtyItemsVerified: boolean = false;
  private invalidMItemEPCs: string[] = [];
  private invalidItemEPCsDisplay: string[] = [];

  constructor(
    private _selectedOrderService: PlSelectedOrderService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _refresh: RefreshService,
    private _commondataService: CommonDataService,
    private _blockchainService: BlockchainService,
    private _resetService: PlResetService,
    private _commonstoreService: CommonStoreService
  ) {
    const isPickAndPackApiCall = 
      this._itsService.getLPTValueByKey(PICK_N_PACK_KEY)
      .pipe(
        filter(value => !!value),
        map(value => value.toLowerCase() === 'yes' ? true : false )
      );
    
    this._refresh.refreshToken$
    .pipe(
      takeUntil(this._resetService.plModuleDestroyed$),
      switchMap(() => isPickAndPackApiCall)
    ).subscribe({
      next: (isPackAndPack) => this.isPickAndPackSubject.next(isPackAndPack)
    });

    this._selectedOrderService.selectedOrderItem$
    .pipe(takeUntil(this._resetService.plModuleDestroyed$))
    .subscribe({
      next: (orderItem) => {
        if (!!orderItem) {
          let allTagItems = [];
          orderItem.PickingList.forEach(listItem => {
            if (listItem.TagItems.length > 0) {
              allTagItems = allTagItems.concat(listItem.TagItems);
            }
          });
          this.onTagItemsUpdate(allTagItems);
        } else {
          this.reset();
        }
      },
      error: (error) => { console.error(error); }
    });
  }

  postPickingListToServerAndBlockchain(pickingScanItems: IItemInfo[], companyId: number): Observable<any> {
    const pickingPostItems = this.getSanitizedPlSubmission();

    if (pickingPostItems.length === 0) { return this._itsdialog.noActionTaken(); }
    else {
      return this._itsService.postPickedItemByHH(pickingPostItems).pipe(
        tap(response => console.log('[pl-submission svc] Post picking list to server', response)),
        concatMap(response => this._itsdialog.postByHH(response)),
        concatMap(dialogResponse => { return dialogResponse.primary && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? this.postPickingListToBlockchain$(pickingScanItems, pickingPostItems, companyId) : of(dialogResponse) }),
      );
    }
  }

  private postPickingListToBlockchain$(pickingScanItems: IItemInfo[], pickingPostItems: IPickedItemByHHLite[], companyId: number): Observable<any> {
    const companyDetails$ = this._itsService.getCompanyByCompanyId(companyId).pipe(
      tap(company => console.log('[pl-submission svc] companyDetails$ company', company)),
      map(companyObject => { return { companyName: companyObject.company_Name, companyAddress: companyObject.addressList[0]?.company_Address ?? "", companyPostcode: companyObject.addressList[0]?.postcode ?? "", companyCountry:  companyObject.addressList[0]?.country ?? ""}; })
    );
    
    return combineLatest({ latlong: this._commondataService.currentLatLong$, destinationCompany: companyDetails$})
    .pipe(
      concatMap(values => this._blockchainService.postToBlockchainMOIfConnectionEnabled$([
        this._blockchainService.getPickingListOriginPostBlock(pickingScanItems, pickingPostItems, values.latlong.Latitude, values.latlong.Longitude),
        this._blockchainService.getPickingListDestinationPostBlock(pickingScanItems, pickingPostItems, values.destinationCompany, values.latlong.Latitude, values.latlong.Longitude)
      ])),
      tap(response => console.log('[pl-submission] post to blockchain response', response)),
      concatMap(res => this._itsdialog.postByHH(res))
    );
  }

  private reset(): void {
    this.mQtyItemsVerified = false;
    this.plSubmissionSubject.next([]);
    this.invalidMItemEPCs = [];
  }

  private onTagItemsUpdate(updatedTagItems: IPLTagItem[]): void {
    function tagItemToPickedItemByHHLine(tagItem: IPLTagItem, username: string, remarks?: string ): IPickedItemByHHLite {
      const submissionLine: IPickedItemByHHLite = {
        "Asset_ID": tagItem.Asset_ID,
        "Qty": tagItem._picked,
        "PickingList_ID": tagItem.PickingList_ID,
        "EPC_ID": tagItem.EPC_ID,
        "Verification_ID": tagItem.Verification_ID,
        "Remarks": "",
        "SM": tagItem.IsIndividual,
        "Package_Master_ID": undefined,
        "Weight": undefined,
        "Creator": username,
      };

      return submissionLine;
    }

    const isInvalidMItem = (tagItem: IPLTagItem) => {
      return tagItem.IsIndividual.toLowerCase() === 'm' && (tagItem._picked === 0 || tagItem.Qty <= 0);
    }

    function zeroQtyMItemExists(tagItems: IPLTagItem[]): boolean {
      return tagItems.some(isInvalidMItem);
    }

    function getZeroQtyMItemIDs(tagItems: IPLTagItem[]): string[] {
      return tagItems.filter(tagItem => isInvalidMItem(tagItem)).map(tagItem => tagItem.EPC_ID);
    }

    /* validation */
    this.mQtyItemsVerified = !zeroQtyMItemExists(updatedTagItems);
    if (zeroQtyMItemExists(updatedTagItems)) {
      this.invalidMItemEPCs = getZeroQtyMItemIDs(updatedTagItems);
      console.log('getZeroQtyMItemIDs', getZeroQtyMItemIDs(updatedTagItems));
      this.invalidItemEPCsDisplay = [...this.invalidMItemEPCs];
    } else {
      this.invalidMItemEPCs = [];
      this.invalidItemEPCsDisplay = [];
    }

    /* generate submission object */
    const username = this._itsService.getKeyCloakUsername();
    const plSubmission = updatedTagItems.map(tagItem => tagItemToPickedItemByHHLine(tagItem, username));
    this.plSubmissionSubject.next(plSubmission);

    console.log('[pl-submission] on tag items update', this.plSubmissionSubject.getValue());
  }

  get packages$(): Observable<IPackageMaster[]> {
    return this._itsService.getPackageMaster();
  }

  onPackageUpdate(packageId: string, weight: number) {
    const currentSubmission = this.plSubmissionSubject.getValue();

    if (currentSubmission?.length > 0) {
      currentSubmission.forEach((line, idx) => {
        currentSubmission[idx]["Weight"] = !!weight ? weight.toString() : null;
        currentSubmission[idx]["Package_Master_ID"] = packageId.toString();
      });

      /* update submission object */
      this.plSubmissionSubject.next(currentSubmission);

      console.log('[pl-submission svc] onPackageUpdate', currentSubmission);
    }
  }

  isMItemQtysVerified(): boolean { return this.mQtyItemsVerified; }

  getDisplayInvalidEPCs(): string[] { return this.invalidItemEPCsDisplay; }

  clearSubmission(): void { this.plSubmissionSubject.next([]); }

  isSubmissionItemsAvailable(): boolean { return this.plSubmissionSubject.getValue().length > 0; }
  
  postPickingListToServer(): Observable<any> {  
    const sanitizedSubmission: IPickedItemByHHLite[] = this.getSanitizedPlSubmission();
    console.log('[pl-submission svc] Post picking items', sanitizedSubmission);

    if (sanitizedSubmission.length > 0) {
      return this._itsService.postPickedItemByHH(sanitizedSubmission).pipe(
        tap(response => console.log('[pl-submission svc] postPickingListToServer response', response)),
        switchMap(response => this._itsdialog.postByHH(response))
      );
    } else {
      return this._itsdialog.noActionTaken();
    }
  }

  getSanitizedPlSubmission(): IPickedItemByHHLite[] {
    return this.plSubmissionSubject.getValue().filter(item => !this.invalidItemEPCsDisplay.includes(item.EPC_ID));
  }

  destroy(): void {}
}

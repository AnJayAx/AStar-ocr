import { Injectable} from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { IBom } from '@its/shared/interfaces/backend/Bom';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { IFirstOperation } from '@its/shared/interfaces/backend/FirstOperation';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { IOperation } from '@its/shared/interfaces/backend/Operation';
import { IOperationTraveler } from '@its/shared/interfaces/backend/OperationTraveler';
import { IProductionTravelerItemInfo } from '@its/shared/interfaces/backend/ProductionTravelerItemInfo';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { IItemTraits } from '@its/shared/interfaces/frontend/ItemTraits';
import { BlockchainService } from '@its/shared/services/blockchain.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, distinctUntilChanged, filter, map, of, shareReplay, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductionTravelerService {

  constructor(
    private _itsService: ItsServiceService,
    private _tagsService: ScannedTagsService,
    private _itsdialog: ItsDialogService,
    private _commondata: CommonDataService,
    private _blockchainService: BlockchainService,
    private _commonstoreService: CommonStoreService,
  ) { }

  getProductNameBySku(sku: string): Observable<string> {
    return this._itsService.getItemMasterBySku(sku).pipe(
      map(itemMasterInfo => itemMasterInfo[0].Name)
    );
  }

  getProductDimensionsBySku(sku: string): Observable<IItemTraits> {
    return this._itsService.getItemMasterBySku(sku).pipe(
      map(itemMasterInfo => { return { height: itemMasterInfo[0].Height, length: itemMasterInfo[0].Length, width: itemMasterInfo[0].Width, weight: itemMasterInfo[0].Weight, lwhUom: itemMasterInfo[0].LWHUOM, weightUom: itemMasterInfo[0].UOM }; })
    );
  }
  
  get incomingBarQRCode$(): Observable<string> {
    return this._tagsService.scannedTags$.pipe(
      tap(tags => console.log('[pt service] incomingBarQRCode', tags)),
      map(tags => tags?.toString()),
    );
  }

  qcTypeToBool(qcType: string): boolean {
    return qcType?.toUpperCase() === 'QC';
  }

  getExpirationMonthsBySku(sku: string): Observable<number> {
    return this._itsService.getItemMasterBySku(sku).pipe(
      map(items => items[0]['ExpirationMonths'])
    );
  }

  getFirstOperationBySku(sku: string): Observable<IOperation> {
    return this._itsService.getOperationBySku(sku).pipe(
      map(operations => { return operations[0] })
    );
  }

  getAllOperationsBySku(sku: string): Observable<IOperation[]> {
    return this._itsService.getOperationBySku(sku);
  }

  postFirstOperation(firstOperation: IFirstOperation): Observable<any> {
    console.log('[pt service] postFirstOperation param', firstOperation);
    return this._itsService.postFirstOperation(firstOperation).pipe(
      switchMap(res => this._itsdialog.postByHH(res))
    );
  }

  postFirstOperationToServerAndBlockchain(firstOperation: IFirstOperation, itemTraits?: IItemTraits): Observable<any> {
    const postToBlockchain$ = this._commondata.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getFirstOperationPostBlock(firstOperation, latlong.Latitude, latlong.Longitude, itemTraits))),
      tap(response => console.log('Post first operation to blockchain', response)),
      switchMap(res => this._itsdialog.postByHH(res))
    );
    
    return this.postFirstOperation(firstOperation).pipe(
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse) })
    );
  }

  postOperationTraveler(operationTraveler: IOperationTraveler): Observable<any> {
    console.log('[pt service] postOperationTraveler param', operationTraveler);
    return this._itsService.postOperationTraveler(operationTraveler).pipe(
      switchMap(res => this._itsdialog.postByHH(res))
    );
  }

  postOperationTravelerToServerAndBlockchain(operationTraveler: IOperationTraveler, operationTravelerScanItems: IProductionTravelerItemInfo[], itemTraits?: IItemTraits): Observable<any> {
    const postToBlockchain$ = this._commondata.currentLatLong$.pipe(
      switchMap(latlong => this._blockchainService.postToBlockchainIfConnectionEnabled$(this._blockchainService.getOperationTravelerPostBlock(operationTraveler, operationTravelerScanItems, latlong.Latitude, latlong.Longitude, itemTraits))),
      tap(response => console.log('Post operation traveler to blockchain', response)),
      switchMap(res => this._itsdialog.postByHH(res))
    );

    return this.postOperationTraveler(operationTraveler).pipe(
      switchMap(dialogResponse => { return dialogResponse.primary  && this._commonstoreService.currentBlockchainConnectionEnabledStatus===true ? postToBlockchain$ : of(dialogResponse) })
    );
  }

  getBomByOperationId(operationId: number): Observable<IBom[]> {
    return this._itsService.getBomByOperationId(operationId?.toString());
  }

  getAllItemMasterSku(): Observable<string[]> {
    return this._itsService.getAllItemMaster().pipe(
      map(items => { return items.map(item => item.SKU); }),
      shareReplay(1)
    );
  }

  getAllCategoryName(): Observable<string[]> {
    return this._itsService.getCategories().pipe(
      map(catItems => { return catItems.map(catItem => catItem.Name); })
    );
  }

  getAllLocations(): Observable<ILocations[]> {
    return this._itsService.getLocations();
  }

  get incomingTagValues$(): Observable<{validTags: string[], existingTags: string[]}> {
    let allTags: string[];
    return this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      tap(tags => allTags = tags),
      switchMap(tags => this.getExistingTags$(tags)),
      map(existingTags => { return { validTags: allTags.filter(tag => !existingTags.includes(tag)), existingTags: existingTags }})
    );
  }
  
  private getExistingTags$(inputTags: string[]): Observable<string[]> {
    const tagParam: IEpcId[] = inputTags.map(tag => { return {"EPC_ID": tag }});
    return this._itsService.postProductionTravelerItemsByEpcId(tagParam).pipe(
      map(itemInfoItems => { return itemInfoItems.map(item => item.EPC_ID); }),
    )
  }
  
  incomingProductionTravelerItems$: Observable<IProductionTravelerItemInfo[]> = this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      distinctUntilChanged((prev, current) => JSON.stringify(prev) === JSON.stringify(current)),
      switchMap(tags => this.getFilteredProductionTravelerItemInfoByEPC$(tags)),
    );

  private getFilteredProductionTravelerItemInfoByEPC$(scanTags: string[]): Observable<IProductionTravelerItemInfo[]> {
    return this._commondata.validCategoryNames$.pipe(
      switchMap(validCategories => 
        this._itsService.postProductionTravelerItemsByEpcId(scanTags.map(tag => { return { "EPC_ID": tag } as IEpcId; }))
          .pipe(
            tap(items => console.log('[pt service] postProductionTravelerItemsByEpcId', items)),
            map(items => { return items.filter(item => validCategories.includes(item.Category))})
          )
      )
    );
  }

  isIncomingProductionTravelerItemsValid(standardItem: IProductionTravelerItemInfo, incomingItems: IProductionTravelerItemInfo[]): boolean {
    function getOpId(operation: IOperation): string {
      return `${operation.OpAc}${operation.Operation_short_text}`;
    }
    const skuCondition = standardItem.SKU;
    const batchNoCondition = standardItem.BatchNo;
    const currentOpCondition = getOpId(standardItem.CO);
    const nextOpCondition = getOpId(standardItem.NO);
    return incomingItems.every(item => item.SKU===skuCondition && item.BatchNo===batchNoCondition && getOpId(item.CO)===currentOpCondition && getOpId(item.NO)===nextOpCondition);
  }

  getInputBomTotalQty(bomItems: IBom[]): number {
    return bomItems.reduce((accumulatorObject, currentObject) => accumulatorObject['Quantity']+currentObject['Quantity'], 0);
  }

  getProductionTravelerScanListTotal(scanItems: IProductionTravelerItemInfo[]): number {
    if (scanItems.length === 0) return 0;
    else if (scanItems.length === 1) return scanItems[0]['LastBal'];
    return scanItems.map(item => item['LastBal']).reduce((accumulatorObject, currentObject) => accumulatorObject+currentObject, 0);
  }
}


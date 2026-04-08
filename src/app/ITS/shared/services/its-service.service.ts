import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';

import { ILocations } from '@its/shared/interfaces/backend/locations';
import { ICategories } from '@its/shared/interfaces/backend/categories';
import { IDataBindings } from '@its/shared/interfaces/backend/databindings';

import { IStockTaking } from '@its/shared/interfaces/backend/SPT_Doc/StockTaking';
import { IStPic } from '../interfaces/backend/SPT_Doc/StPic';
import { IStRefNo } from '../interfaces/backend/SPT_Doc/StRefNo';
import { IOngoingST } from '../interfaces/backend/SPT_Doc/OngoingST';
import { ISTItemCategory } from '../interfaces/backend/SPT_Doc/STItemCategory';
import { ISTItemLocation } from '../interfaces/backend/SPT_Doc/STItemLocation';
import { ISTItemPIC } from '../interfaces/backend/SPT_Doc/STItemPIC';
import { ISTItem } from '../interfaces/backend/SPT_Doc/STItem';
import { ISTItemRefNo } from '../interfaces/backend/SPT_Doc/STItemRefNo';
import { IStockTakingByHH } from '../interfaces/backend/SPT_Doc/StockTakingByHH';
import { IItemInfo } from '../interfaces/backend/ItemInfo';
import { IPLOrder } from '../interfaces/backend/PLOrder';
import { IItsSetting } from '../interfaces/backend/ItsSetting';
import { IPickedItemByHHLite } from '../interfaces/backend/SPT_Doc/PickedItemByHH';
import { IModule } from '../interfaces/backend/Module';
import { ICategory } from '../interfaces/backend/Category';
import { IPostByHHResponse } from '../interfaces/backend/PostByHHResponse';
import { IScrapItem } from '../interfaces/frontend/scrapItem';
import { IMRORecord } from '../interfaces/frontend/MROItem';
import { IRelocationItem } from '../interfaces/frontend/relocationItem';
import { ICheckInOutItem } from '../interfaces/frontend/CheckInOutItem';
import { IInboundItem } from '../interfaces/backend/InboundItem';
import { IImageItem } from '../interfaces/backend/imageItem';
import {
  IReceiveVerifyOrder,
  IReceiveVerifyOrderPickedLine,
} from '../interfaces/backend/SPT_Doc/ReceiveVerifyOrder';
import { UpdateItem } from '@its/shared/interfaces/frontend/updateItem';
import { IHHSplit } from '../interfaces/backend/HHSplit';
import { ItsSettingsService } from './its-settings.service';
import { IPackageMaster } from '../interfaces/backend/SPT_Doc/PackageMaster';
import { FlowHistoryEntry } from '../interfaces/backend/FlowHistory';
import { MroHistoryEntry } from '../interfaces/backend/MROHistory';
import { IRepack } from '../interfaces/backend/Repack';
import { IEpcId } from '../interfaces/backend/EpcId';
import { IItemMaster } from '../interfaces/backend/ItemMaster';
import { IVerifyPassHH } from '../interfaces/backend/VerifyPassHH';
import { IRefurbishment } from '../interfaces/backend/Refurbishment';
import { BYPASS_HTTP_INTERCEPTOR } from '@dis/services/http/http-interceptor.service';
import { IPostBlock } from '../interfaces/blockchain/PostBlock';
import { ICompany } from '../interfaces/backend/Customer/Company';
import { IUser } from '../interfaces/backend/User';
import { IBom } from '../interfaces/backend/Bom';
import { IFirstOperation } from '../interfaces/backend/FirstOperation';
import { IOperation } from '../interfaces/backend/Operation';
import { IOperationTraveler } from '../interfaces/backend/OperationTraveler';
import { IProductionTravelerItemInfo } from '../interfaces/backend/ProductionTravelerItemInfo';
import { IRefurbishmentOperation } from '../interfaces/backend/RefurbishmentOperation';
import { IPlOrderInfo } from '../interfaces/backend/SPT_Doc/PlOrderInfo';
import { ILoanReturnItem } from '../interfaces/frontend/loanReturnItem';
import { ICustomer } from '../interfaces/backend/Customer/Customer';
import { ICustomerAddress } from '../interfaces/backend/Customer/CustomerAddress';
import { SubMRO } from '../interfaces/backend/SubMRO';
import { TagReuseItem } from '../interfaces/backend/TagReuseItem';
import {
  WheelPartBatchItem,
  WheelPartRegistrationResult,
  RFIDPrintResult,
} from '../interfaces/blockchain/WheelInterfaces';
import { CreateWheelBody } from '../interfaces/backend/Wheel';

@Injectable({
  providedIn: 'root',
})
export class ItsServiceService {
  private baseAPIItemTracking: string;
  private baseAPISPTDoc: string;
  private baseAPICustomer: string;

  private keycloakUsername: string = '';
  private serverUserId: string = '';
  private keycloakUserId: string = '';

  constructor(
    private http: HttpClient,
    private _itssettingsService: ItsSettingsService
  ) {
    /* Set URLs */
    const environmentSettings$ = combineLatest({
      httpsOnly: this._itssettingsService.httpsOnly$,
      defaultCustomUrlEnabled:
        this._itssettingsService.defaultCustomUrlEnabled$,
      itemTrackingIP: this._itssettingsService.itemTrackingIP$,
      itemTrackingPort: this._itssettingsService.itemTrackingPort$,
      itemTrackingCustomUrl: this._itssettingsService.itemTrackingUrl$,
      // sptDocCustomUrlEnabled: this._itssettingsService.defaultCustomUrlEnabled$,
      sptDocIP: this._itssettingsService.sptDocIP$,
      sptDocPort: this._itssettingsService.sptDocPort$,
      sptDocCustomUrl: this._itssettingsService.sptDocUrl$,
      // customerCustomUrlEnabled: this._itssettingsService.defaultCustomUrlEnabled$,
      customerIP: this._itssettingsService.customerIP$,
      customerPort: this._itssettingsService.customerPort$,
      customerCustomUrl: this._itssettingsService.customerUrl$,
    });

    environmentSettings$.subscribe((values) => {
      const httpPrefix = values.httpsOnly ? 'https' : 'http';
      this.baseAPIItemTracking = values.defaultCustomUrlEnabled
        ? values.itemTrackingCustomUrl
        : `${httpPrefix}://${values.itemTrackingIP}:${values.itemTrackingPort}/api`;
      console.log(
        '[its-service] baseAPIItemTracking:',
        this.baseAPIItemTracking
      );
      this.baseAPISPTDoc = values.defaultCustomUrlEnabled
        ? values.sptDocCustomUrl
        : `${httpPrefix}://${values.sptDocIP}:${values.sptDocPort}/api`;
      console.log('[its-service] baseAPISPTDoc', this.baseAPISPTDoc);
      this.baseAPICustomer = values.defaultCustomUrlEnabled
        ? values.customerCustomUrl
        : `${httpPrefix}://${values.customerIP}:${values.customerPort}/api`;
      console.log('[its-service] baseAPICustomer', this.baseAPICustomer);
    });

    /* Set Keycloak User info */
    this._itssettingsService.keycloakUsername$.subscribe({
      next: (username) => {
        this.keycloakUsername = username;
        console.log('[its-service] keycloakUsername defined', username);
      },
    });

    this._itssettingsService.keycloakUsername$
      .pipe(switchMap((username) => this.getUserIDByUsername(username)))
      .subscribe({
        next: (userId) => {
          this.serverUserId = userId;
          console.log('[its-service] serverUserId', userId);
        },
      });
  }

  /* GLOBAL */
  getKeyCloakUsername() {
    return this.keycloakUsername;
  }
  getServerUserId() {
    return this.serverUserId;
  }
  getKeycloakUserId() {
    return this.keycloakUserId;
  }

  getUserIDByUsername(username: string): Observable<any> {
    return this.http.get<any>(
      this.baseAPIItemTracking + '/Users/UserID/' + username
    );
  }
  getUserByUserId(userid: number): Observable<IUser> {
    return this.http.get<IUser>(this.baseAPIItemTracking + `/Users/${userid}`);
  }
  getAssignedUserCategoriesByUserName() {
    return this.http.get<ICategory[]>(
      this.baseAPIItemTracking +
        `/UserCategories/getAssignedUserCategoriesByUserName/${this.keycloakUsername}`
    );
  }
  getCategories() {
    return this.http.get<ICategories[]>(this.baseAPIItemTracking + '/Category');
  }
  getLocations() {
    return this.http.get<ILocations[]>(this.baseAPIItemTracking + '/Location');
  }
  getAllItemMaster() {
    return this.http.get<IItemMaster[]>(
      this.baseAPIItemTracking + `/ItemMaster`
    );
  }
  getItemMasterBySku(sku: string) {
    return this.http.get<IItemMaster[]>(
      this.baseAPIItemTracking + `/ItemMaster/GetItemMasterBySKU/${sku}`
    );
  }

  getPhotoFile(assetID: string): Observable<Blob> {
    return this.http.get(
      this.baseAPIItemTracking + `/AttachFile/PhotoFile/${assetID}`,
      {
        responseType: 'blob',
        context: new HttpContext().set(BYPASS_HTTP_INTERCEPTOR, true),
      }
    );
  }
  getITSSettingByKey(itsKey: string) {
    return this.http.get<IItsSetting[]>(
      this.baseAPIItemTracking + `/ITSSetting/${itsKey}`
    );
  }
  getLPTValueByKey(lptKey: string): Observable<string> {
    return this.http.get(
      this.baseAPIItemTracking + `/ITSSetting/LPTValue/${lptKey}`,
      { responseType: 'text' }
    );
  }

  /* 
      this is for checking agianst S/N and PartNo
  */
  getExistingWheelSetAssets(refNo: string, batchNo: string) {
    return this.http.get<any>(
      this.baseAPIItemTracking +
        `/Item/ByWheelSets/?refNo=${refNo}&batchNo=${batchNo}`
    );
  }

  /* MAIN MENU */
  getAssignedMobileUserModulesByUserName() {
    return this.http.get<IModule[]>(
      this.baseAPIItemTracking +
        `/UserModule/AssignedUserModulesByUserName/${this.keycloakUsername}`
    );
  }

  /*
  eg.
  var locationjson = { "id": (myForm.value["id"].value), "name": (myForm.value["name"].value), "status": "", "creator": "" };
  const params = JSON.stringify(locationjson);
  */
  getLocationId(locationNme: string) {
    return this.http.get(
      this.baseAPIItemTracking + '/Location/LocationID/' + locationNme,
      { responseType: 'text' }
    );
  }

  registerItem(
    docNo: string,
    newAsset: IInboundItem[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(newAsset);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post<any>(
        this.baseAPIItemTracking +
          '/Inbound/ImportCSV/' +
          this.keycloakUsername +
          '/' +
          docNo,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res[0]));
  }

  registerWheelhub(newAsset: any[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(newAsset);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      this.baseAPIItemTracking + '/Inbound/GRItems/' + this.serverUserId,
      params,
      { headers, responseType: 'json' }
    );
  }

  /* 
      this is for registering ALL the wheel parts
  */
  registerItemJob(
    newAssets: WheelPartBatchItem[]
  ): Observable<WheelPartRegistrationResult[]> {
    const params = JSON.stringify(newAssets);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post<any>(this.baseAPIItemTracking + '/Item/batch/', params, {
        headers,
        responseType: 'json',
      })
      .pipe(
        map((res) => {
          console.log('registerItemJob | res', res);
          return res;
        })
      );
  }

  /* 
    Retrieve document number for the module
    - Keyword can be found from backend code (AItem.cs lines 2284 - 2318)
  */
  getDocNo(keyword: string) {
    return this.http.get(
      this.baseAPIItemTracking + '/FlowHistory/GetDocNo/' + keyword,
      { responseType: 'text' }
    );
  }

  getDataBinding() {
    return this.http.get<IDataBindings[]>(
      this.baseAPIItemTracking + '/DataBinding/DataMapping'
    );
  }

  postImages(imgItems: IImageItem[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(imgItems);
    console.log('postImages', params);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/Image/PostImages', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  postCheckIn(checkinItem: ICheckInOutItem[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(checkinItem);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/CheckIn', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  postCheckOut(checkoutItem: ICheckInOutItem[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(checkoutItem);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/CheckOut', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  postItemsByEpcId(epcId: IEpcId[]): Observable<IItemInfo[]> {
    /* Returns a list of items with the corresponding EPC IDs */
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      this.baseAPIItemTracking + '/Item/ItemInfoByEPCIDS',
      epcId,
      { headers, responseType: 'json' }
    );
  }

  postItemsByEpcIdLotNo(epcId: IEpcId[], LotNo): Observable<IItemInfo[]> {
    /* Returns a list of items with the corresponding EPC IDs */
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      this.baseAPIItemTracking + '/Item/ItemInfoByEPCIDS_Lot/' + LotNo,
      epcId,
      { headers, responseType: 'json' }
    );
  }

  postRelocation(
    items: IRelocationItem[],
    newLocationId: number
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(items);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/Relocation/' + newLocationId, params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  //scrap
  postScrap(items: IScrapItem[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(items);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/Scrap/', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }
  // STOCK MERGE
  postStockMergeAndScrap(
    updateEpcId: string,
    items: IScrapItem[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(items);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + `/Scrap/${updateEpcId}`, params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  /* MRO */
  postMROs(mroRecords: IMRORecord[]): Observable<IPostByHHResponse> {
    const params = JSON.stringify(mroRecords);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + '/MRO/PostMROs', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res as IPostByHHResponse));
  }

  /* UPDATE MRO */
  putMROs(
    mroRecords: IMRORecord[],
    Asset_MRO_History_ID
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(mroRecords);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .put(
        this.baseAPIItemTracking + `/MRO/PutMROs/${Asset_MRO_History_ID}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }

  //Loan
  postLoan(
    loanItems: ILoanReturnItem[],
    newLocationId: number
  ): Observable<IPostByHHResponse> {
    /* for LoanReturn -- loan */
    const params = JSON.stringify(loanItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking + '/LoanReturn/Loan/' + newLocationId,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res[0]));
  }

  //Update
  modifyItem(
    assetID: number,
    userID: string,
    item: UpdateItem
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(item);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .put(
        this.baseAPIItemTracking + '/Item/modifyItem/' + assetID + '/' + userID,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  modifyItems(
    userID: string,
    itemArr: UpdateItem[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(itemArr);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .put(this.baseAPIItemTracking + '/Item/modifyItems/' + userID, params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res as IPostByHHResponse));
  }

  // Return side
  postReturn(
    returnItems: ILoanReturnItem[],
    newLocationId: number
  ): Observable<IPostByHHResponse> {
    /* for LoanReturn -- return */
    const params = JSON.stringify(returnItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking + '/LoanReturn/Return/' + newLocationId,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res[0]));
  }

  /* STOCKTAKING */
  getStockTaking() {
    return this.http.get<IStockTaking[]>(this.baseAPISPTDoc + '/StockTaking');
  }
  getStockTakingByStNo(stNo: string) {
    return this.http.get<IStockTaking[]>(
      this.baseAPISPTDoc + `/StockTaking/${stNo}`
    );
  }
  getStPICByStNo(stNo: string) {
    return this.http.get<IStPic[]>(this.baseAPISPTDoc + `/STPIC/${stNo}`);
  }
  getStRefNoByStNo(stNo: string) {
    return this.http.get<IStRefNo[]>(this.baseAPISPTDoc + `/STRefNo/${stNo}`);
  }
  getStItemByStNo(stNo: string) {
    return this.http.get<ISTItem[]>(
      this.baseAPISPTDoc + `/StockTakingItem/${stNo}`
    );
  }

  getOngoingSTByUsername() {
    return this.http.get<IOngoingST[]>(
      this.baseAPISPTDoc + `/StockTaking/GetOnGoingST/${this.keycloakUsername}`
    );
  }
  getSTItemCategory(stNo: string) {
    return this.http.get<ISTItemCategory[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemCategory/${stNo}/${this.keycloakUsername}`
    );
  }
  getSTItemLocation(stNo: string) {
    return this.http.get<ISTItemLocation[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemLocation/${stNo}/${this.keycloakUsername}`
    );
  }
  getSTItemPIC(stNo: string) {
    return this.http.get<ISTItemPIC[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemPIC/${stNo}/${this.keycloakUsername}`
    );
  }
  getSTItemRefNo(stNo: string) {
    return this.http.get<ISTItemRefNo[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemRefNo/${stNo}/${this.keycloakUsername}`
    );
  }

  getSTItemByUsername(stNo: string) {
    return this.http.get<ISTItem[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemByUserName/${stNo}/${this.keycloakUsername}`
    );
  }
  getSTItemPendingByUsername(stNo: string) {
    return this.http.get<ISTItem[]>(
      this.baseAPISPTDoc +
        `/StockTakingItem/GetSTItemPendingByUserName/${stNo}/${this.keycloakUsername}`
    );
  }
  getStockTakingItem(stNo: string) {
    return this.http.get<ISTItem[]>(
      this.baseAPISPTDoc + `/StockTakingItem/${stNo}`
    );
  }
  postStockTakingByHH(
    stocktakingDetails: IStockTakingByHH
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(stocktakingDetails);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPISPTDoc + '/StockTaking/ByHH', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res[0]));
  }

  /* PICKING LIST */
  getAvailableOrdersInfo() {
    return this.http.get<IPlOrderInfo[]>(
      this.baseAPISPTDoc + `/PickingList/GetAvailableOrdersNew`
    );
  }
  getAvailableOrders() {
    return this.http.get<IPLOrder[]>(
      this.baseAPISPTDoc + `/PickingList/GetAvailableOrders`
    );
  } // { params: new HttpParams().set('skipBlockingUI', 'false') }
  getOrderByOrderNo(orderNo: string) {
    return this.http.get<IPLOrder>(
      this.baseAPISPTDoc + `/PickingList/GetOrderByOrderNo/${orderNo}`
    );
  }
  getOrderByVerificationId(verificationId: string) {
    return this.http.get<IPLOrder>(
      this.baseAPISPTDoc + `/PickingList/${verificationId}`
    );
  }
  // postPickedItemByHH(pickedItems: IPickedItemByHH[]): Observable<IPostByHHResponse> {
  //   const params = JSON.stringify(pickedItems);
  //   const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.http.post(this.baseAPISPTDoc + '/PickedItem/ByHH', params, { headers, responseType: 'json' }).pipe(map(res => res as IPostByHHResponse));
  // }
  postPickedItemByHH(
    pickedItems: IPickedItemByHHLite[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(pickedItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPISPTDoc + '/PickedItem/ByHH', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res as IPostByHHResponse));
  }
  getPackageMaster(): Observable<IPackageMaster[]> {
    return this.http.get<IPackageMaster[]>(
      this.baseAPISPTDoc + `/PackageMaster/`
    );
  }

  /* LOCATING */
  getItemInfoByKeyword(keyword: string) {
    return this.http.get<IItemInfo[]>(
      this.baseAPIItemTracking + `/Item/InfoByKeyword/${keyword}`
    );
  }

  /* RECEIVE/VERIFY */
  getAvailableReceiveVerifyOrders() {
    return this.http.get<IReceiveVerifyOrder[]>(
      this.baseAPISPTDoc + `/PickingList/GetAvailableReceiveVerifyOrders`
    );
  }
  getPickedItemByOrderID(orderID: number) {
    return this.http.get<IReceiveVerifyOrderPickedLine[]>(
      this.baseAPISPTDoc +
        `/PickedItem/GetPickedItembyOrderIDNoReceived/${orderID}`
    );
  }
  postReceiveVerify(
    receiveVerifyItems: IReceiveVerifyOrderPickedLine[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(receiveVerifyItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPISPTDoc + '/PickedItem/RecieveVerifyHH', params, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res as IPostByHHResponse));
  }

  /* ITEM SPLIT */
  postHHSplit(itemSplitItems: IHHSplit): Observable<IPostByHHResponse> {
    const params = JSON.stringify(itemSplitItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking + `/Inbound/HHSplit/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  postRepackItem(repackItem: IRepack): Observable<IPostByHHResponse> {
    const params = JSON.stringify(repackItem);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking +
          `/Inbound/RepackItemHH/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }

  /* CHECK STATUS */
  getFlowHistoryByAssetId(assetID: string) {
    return this.http.get<FlowHistoryEntry[]>(
      this.baseAPIItemTracking + `/FlowHistory/${assetID}`
    );
  }
  getMROHistoryByAssetId(assetID: string) {
    return this.http.get<MroHistoryEntry[]>(
      this.baseAPIItemTracking + `/MROHistory/${assetID}`
    );
  }

  getMROHistoryIfExistByAssetId(assetID: string) {
    return this.http.get<MroHistoryEntry[]>(
      this.baseAPIItemTracking + `/MROHistory/MROHistoryExist/${assetID}`
    );
  }
  getSubMROHistoryByAssetHistoryId(assetHistoryID: number) {
    return this.http.get<SubMRO[]>(
      this.baseAPIItemTracking + `/SUBMRO/${assetHistoryID}`
    );
  }

  /* GR VERIFY */
  getGrItemInfoByBatchNoAndStatus(batchNo: string, status: string) {
    return this.http.get<IItemInfo[]>(
      this.baseAPIItemTracking + `/QC/ItemInfo/${status}/${batchNo}/batchno`
    );
  }
  getGrItemInfoByRefNoAndStatus(refNo: string, status: string) {
    return this.http.get<IItemInfo[]>(
      this.baseAPIItemTracking + `/QC/ItemInfo/${status}/${refNo}/refno`
    );
  }
  postGRVerifyHH(
    grVerifyItems: IVerifyPassHH[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(grVerifyItems);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // return this.http.post(this.baseAPIItemTracking + `/QC/SubmitQAPassHH/${this.keycloakUsername}`, params, { headers, responseType: 'json' }).pipe(map(res => res as IPostByHHResponse));
    return this.http
      .post(
        this.baseAPIItemTracking +
          `/QC/SubmitVerifyPassHH/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }

  /* REFURBISHMENT */
  getAllRefurbishmentOperations() {
    return this.http.get<IRefurbishmentOperation[]>(
      this.baseAPIItemTracking + `/RefurbishmentOperations`
    );
  }
  postRefurbishment(
    refurbishment: IRefurbishment
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(refurbishment);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking +
          `/MROHistory/SubmitRefurbishment/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }

  /* PRODUCTION TRAVELER */
  getOperationBySku(sku: string) {
    return this.http.get<IOperation[]>(
      this.baseAPIItemTracking + `/Operation/GetOperationBySKU/${sku}`
    );
  }
  getBomBySku(sku: string) {
    return this.http.get<IBom[]>(
      this.baseAPIItemTracking + `/BOM/GetBOMBySKU/${sku}`
    );
  }
  getBomByOperationId(operationId: string) {
    return this.http.get<IBom[]>(
      this.baseAPIItemTracking + `/BOM/GetBOMByOperationID/${operationId}`
    );
  }
  postFirstOperation(
    firstOperation: IFirstOperation
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(firstOperation);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking +
          `/ProductionTraveler/FirstOperation/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  postOperationTraveler(
    operationTraveler: IOperationTraveler
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(operationTraveler);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking +
          `/ProductionTraveler/OperationTraveler/${this.keycloakUsername}`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  postProductionTravelerItemsByEpcId(
    epcIds: IEpcId[]
  ): Observable<IProductionTravelerItemInfo[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      this.baseAPIItemTracking + '/ProductionTraveler/ItemInfoByEPCIDS',
      epcIds,
      { headers, responseType: 'json' }
    );
  }

  /* WRITE-OFF */
  getWriteOffListByDocNo(documentNo: string) {
    return this.http.get<IItemInfo[]>(
      this.baseAPIItemTracking + `/WriteOff/${documentNo}`
    );
  }

  /* TAG REUSE */
  postTagReuse(
    docNo: string,
    newReuseItem: TagReuseItem
  ): Observable<IPostByHHResponse> {
    const params = [newReuseItem];
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post<any>(
        this.baseAPIItemTracking +
          '/Inbound/ScrappedAndImportCSV/' +
          this.keycloakUsername +
          '/' +
          docNo,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res[0]));
  }

  /* BLOCKCHAIN */
  blockChainGetConnect() {
    return this.http.get<boolean>(
      this.baseAPIItemTracking + `/BlockChainConnector/Connect`
    );
  }
  blockchainConnect(): Observable<IPostByHHResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(this.baseAPIItemTracking + `/BlockChainConnector/ConnectResponse`, {
        headers,
        responseType: 'json',
      })
      .pipe(map((res) => res as IPostByHHResponse));
  }
  postToBlockchain(postBlockParam: IPostBlock): Observable<IPostByHHResponse> {
    const params = JSON.stringify(postBlockParam);
    console.log(`[postToBlockchain] param: ${params}`, postBlockParam);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking + `/BlockChainConnector/PostToBlockChain`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  postToBlockchainMO(
    postBlockArrParam: IPostBlock[]
  ): Observable<IPostByHHResponse> {
    const params = JSON.stringify(postBlockArrParam);
    console.log(`[postToBlockchainMO] param: ${params}`, postBlockArrParam);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post(
        this.baseAPIItemTracking + `/BlockChainConnector/PostToBlockChainMO`,
        params,
        { headers, responseType: 'json' }
      )
      .pipe(map((res) => res as IPostByHHResponse));
  }
  getBlockchainProductInfoById(productId: string) {
    return this.http.get<any>(
      this.baseAPIItemTracking +
        `/BlockchainConnector/LastSmartContract/${productId}`
    );
  }

  /* CUSTOMER -- for Blockchain */
  //for hoya or otsuka
  getCompanyByCompanyId(companyId: number) {
    return this.http.get<ICompany>(
      this.baseAPICustomer + `/v1/Company/${companyId}`
    );
  }
  //getCompanyByCompanyId(companyId: number) { return this.http.get<ICompany>(this.baseAPICustomer + `/Company/${companyId}`); }
  getCustomerByName(customerName: string) {
    return this.http.get<ICustomer>(
      this.baseAPISPTDoc + `/Customer/GetCustomerByName/${customerName}`
    );
  }
  getCustomerAddressByCustomerAddressId(addressId: string) {
    return this.http.get<ICustomerAddress>(
      this.baseAPISPTDoc + `/CustomerAddress/${addressId}`
    );
  }
  getCustomerAddressByCustomerId(customerId: number) {
    return this.http.get<ICustomerAddress[]>(
      this.baseAPISPTDoc +
        `/CustomerAddress/GetCustomerAddressByCustomerId/${customerId}`
    );
  }

  // wheels (for SIA Wheelhub)
  getWheelBySerialNo(serialNoString: string) {
    return this.http.get<any>(
      this.baseAPIItemTracking +
        `/Wheel/BySerialNums?serialNums=${serialNoString}`
    );
  }
  // wheelFormat
  getWheelFormats() {
    return this.http.get<any>(this.baseAPIItemTracking + '/WheelFormat');
  }

  // stub to represent the printing process currently
  printAssetTags(
    refNo: string,
    partNo: string,
    rfidTags: string[]
  ): Observable<RFIDPrintResult[]> {
    const body = {
      Ref_No: refNo,
      BatchNo: partNo,
      RFIDCodes: rfidTags,
    };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.put<RFIDPrintResult[]>(
      this.baseAPIItemTracking + '/Item/PrintRFID/',
      body,
      { headers, responseType: 'json' }
    );
    // const jobs = rfidTags.map((tag) => {

    //   return new Promise<BarcodePrintResult>((resolve) => {
    //     const randomDelay = Math.floor(Math.random() * 5000) + 1000; // 1–5s
    //     const isPrinted = Math.random() < 0.9;

    //     setTimeout(() => {
    //       resolve({
    //         index: tag.index,
    //         isPrinted,
    //       });
    //     }, randomDelay);
    //   });
    // });

    // return Promise.all(jobs);
  }

  createNewWheel(newWheel: CreateWheelBody): Observable<IPostByHHResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(this.baseAPIItemTracking + '/Wheel', newWheel, {
      headers,
      responseType: 'json',
    });
  }
}

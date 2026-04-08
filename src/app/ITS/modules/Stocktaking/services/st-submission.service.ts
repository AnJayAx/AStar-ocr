import { Injectable } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { StorageService } from '@dis/services/storage/storage.service';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { IStockTakingByHH } from '@its/shared/interfaces/backend/SPT_Doc/StockTakingByHH';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Observable, switchMap, tap } from 'rxjs';
import { StListItem } from '../st-details/data';
import { StDetailsStorageKeys, StScanStorageKeys, STStatus } from '../stocktaking.constants';

export enum StockTakeErrorStatusCodes {
  Missing = 0,
  UndefinedQtys = 1,

  MissingSTNo = 2,
  MissingLocUpdate = 3,
  MissingLoc = 4,
  MissingPostItems = 5
}

@Injectable({
  providedIn: 'root'
})
export class StSubmissionService {

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private storage: StorageService,
    private toast: ToastService,
  ) { }

  postStocktaking(): Observable<any> {
    const stocktakeSubmission = this.getStockTakeSubmission();

    console.log('postStocktaking', stocktakeSubmission);
    return this._itsService.postStockTakingByHH(stocktakeSubmission as IStockTakingByHH).pipe(
      switchMap(res => this._itsdialog.postByHH(res))
    );
  }

  getStockTakeSubmission(): IStockTakingByHH | StockTakeErrorStatusCodes {
    const stNoStr = this.storage.getItem(StDetailsStorageKeys.selectedStId);
    const needsUpdateLocStr = this.storage.getItem(StScanStorageKeys.postUpdateItemsLoc);
    const locsStr = this.storage.getItem(StDetailsStorageKeys.selectedLocs);
    const postItemsStr = this.storage.getItem(StScanStorageKeys.postSTItems);

    if (this.storage.itemIsUndefinedOrEmpty(stNoStr)) { 
      console.log('No stock take number found.'); 
      return StockTakeErrorStatusCodes.MissingSTNo; 
    }
    if (this.storage.itemIsUndefinedOrEmpty(needsUpdateLocStr)) { 
      console.log('No specification for whether to update location.'); 
      return StockTakeErrorStatusCodes.MissingLocUpdate; 
    }
    if (this.storage.itemIsUndefinedOrEmpty(locsStr)) { 
      console.log('No stock take location found.'); 
      return StockTakeErrorStatusCodes.MissingLoc; 
    }
    if (this.storage.itemIsUndefinedOrEmpty(postItemsStr)) { 
      this.toast.error('No scanned stock take items found'); 
      return StockTakeErrorStatusCodes.MissingPostItems; 
    }

    const stNoDat: StListItem = JSON.parse(stNoStr);
    const stNo: string = stNoDat.stNo;

    const needsUpdateLoc: string = needsUpdateLocStr;
    
    const locs: { value: string, label: string}[] = JSON.parse(locsStr);
    const stLocs: { ID: string, Name: string}[] = locs.map(loc => { return {ID: loc.value, Name: loc.label}; });
    
    const stocktakeItems: ISTItem[] = JSON.parse(postItemsStr);
    const stocktakeItemsPosted = stocktakeItems.filter(item => this.isPostStocktakeItem(item));

    if (stocktakeItemsPosted.length <= 0) { 
      console.log('no stock take items found');
      return StockTakeErrorStatusCodes.Missing; 
    }

    const needsUpdateLocBool = needsUpdateLoc.toLowerCase() === 'true' ? true : false;
    if (this.validateStocktakeItemQtys(stocktakeItemsPosted) === false && needsUpdateLocBool) {
      console.log('Undefined qtys');
      return StockTakeErrorStatusCodes.UndefinedQtys;
    }

    const stSubmission: IStockTakingByHH = {
      "LoginUser": this._itsService.getKeyCloakUsername(),
      "St_No": stNo,
      "needsUpdateLocation": needsUpdateLoc,
      "ST_Locs": stLocs,
      "ST_Items": stocktakeItemsPosted
    };

    return stSubmission;
  }

  private isPostStocktakeItem(stItem: ISTItem): boolean {
    return stItem.Status == STStatus.Found || stItem.Status == STStatus.Misplaced;
  }
 b
  private validateStocktakeItemQtys(postStocktakeItems: ISTItem[]): boolean {
    let validated = true;
    const checkMItems = postStocktakeItems.filter(item => item.SM.toLowerCase() === 'm' && (item.Status == STStatus.Found || item.Status == STStatus.Misplaced));
    checkMItems.forEach(mItem => {
      if (mItem.ST_Qty === undefined || mItem.ST_Qty === null) {
        validated = false;
        return;
      }
    });
    return validated;
  }
}

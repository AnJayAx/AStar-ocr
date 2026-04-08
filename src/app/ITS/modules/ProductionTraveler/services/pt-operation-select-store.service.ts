import { Injectable } from '@angular/core';
import { IOperation } from '@its/shared/interfaces/backend/Operation';
import { IItemTraits } from '@its/shared/interfaces/frontend/ItemTraits';

const INIT_SKU_ITEM_TRAITS_STATE: IItemTraits = {height: null, length: null, width: null, weight: null, lwhUom: null, weightUom: null };

@Injectable({
  providedIn: 'root'
})
export class PtOperationSelectStoreService {

  skuState: string = '';
  selectedSkuItemTraitsState: IItemTraits = INIT_SKU_ITEM_TRAITS_STATE;
  isFirstOpState: boolean = false;
  firstOpState: IOperation;

  setSkuState(sku: string) { this.skuState = sku; }
  setIsFirstOpState(isFirstOp: boolean) { this.isFirstOpState = isFirstOp; }
  setFirstOpState(firstOp: IOperation) { this.firstOpState = firstOp; } 
  setSelectedSkuItemTraitsState(itemTrait: IItemTraits) { this.selectedSkuItemTraitsState = itemTrait; }

  reset() {
    this.skuState = '';
    this.isFirstOpState = false;
    this.firstOpState = undefined;
    this.selectedSkuItemTraitsState = INIT_SKU_ITEM_TRAITS_STATE;
  }

  constructor() { }
}

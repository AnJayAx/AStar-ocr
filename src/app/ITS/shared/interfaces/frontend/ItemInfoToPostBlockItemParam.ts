import { IItemInfo } from "../backend/ItemInfo";
export interface IItemInfoToPostBlockItem {
    itemInfoObject: IItemInfo;
    refurbishType?: string;
    weight?: string;
    remarks?: string;
    isCostEqualPrice?: boolean;  
}
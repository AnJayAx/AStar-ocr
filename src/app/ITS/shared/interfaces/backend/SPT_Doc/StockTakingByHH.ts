import { ISTItem } from "./STItem";

export interface IStockTakingByHH {
    "LoginUser": string;
    "St_No": string;
    "needsUpdateLocation": string;
    "ST_Locs": { "ID": string, "Name": string }[];
    "ST_Items": ISTItem[];
  }
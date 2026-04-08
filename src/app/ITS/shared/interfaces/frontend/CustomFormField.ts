import { DataItem } from "./DataItem";

export interface CustomFormField {
    field: string;
    label: string;
    storageKey: string;
    required?: boolean;
    dataItemList?: Array<DataItem>;
}
  
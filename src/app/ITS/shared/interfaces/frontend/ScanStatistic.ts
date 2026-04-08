import { STStatus } from "@its/modules/Stocktaking/stocktaking.constants";

export interface ScanStatistic {
    statName: string;
    statFilter: STStatus;
    statNumber: number;
    statusCode: number;
    bgColor?: string;
    fontColor?: string;
    detailsPageLink?: string;
}
  
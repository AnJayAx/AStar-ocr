import { IScanViewListFilter } from "@its/shared/interfaces/frontend/ScanViewListFilter";

export const STOCKMERGE_FILTEROUT: IScanViewListFilter[] = [
    { property: 'Asset_StatusName', value: 'On Loan' },
    { property: 'Asset_StatusName', value: 'NotAvailable' },
    { property: 'Asset_StatusName', value: 'On Hold' },
    { property: 'Asset_StatusName', value: 'Scrapped' },
];
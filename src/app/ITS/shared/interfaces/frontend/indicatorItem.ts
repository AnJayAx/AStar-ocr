// object type of items to be posted to backend in general
// to retrieve info about items from scanned tags
export interface IIndicatorItem {
    "EPC_ID": string,
    "SM": string,
    "Category": string,
    "Asset_ID": number,
    "Asset_No": string,
    "Description": string,
    "Asset_LocationLocation": string,
    "Asset_StatusName": string,
    "LastBal": number,
    "Indicator_Status": string,
    "isSelected": boolean;
}
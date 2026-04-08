export const StDetailsStorageKeys = { 
  selectedStId: 'stdetails_stid',
  selectedCats: 'stdetails_cats',
  selectedLocs: 'stdetails_locs',
  selectedPICs: 'stdetails_pics',
  selectedRefNo: 'stdetails_refno',
};

export const StScanStorageKeys = {
  postSTItems: 'stscan_poststitems',
  foundItemsLoaded: 'stscan_founditemsloaded',
  postUpdateItemsLoc: 'stscan_postupdateitemsloc',
};

export enum STStatus {
  Submitted = "Submitted",  /* For frontend use. Not an actual stocktaking status; Represents past found items */
  Pending = "Pending",
  Found = "Found",
  Misplaced = "Misplaced",
  Excess = "Excess",
  NoAccess = "No Access",
  NotRegistered = "Not Registered"
}

export const FILTER_PAGE_MAPPING = [
  { filter: STStatus.Submitted, path: '/st-scan-menurouter/st-scan-overview' },
  { filter: STStatus.Pending, path: '/st-scan-menurouter/st-scan-overview' },
  { filter: STStatus.Found, path: '/st-scan-menurouter/st-scan-found' },
  { filter: STStatus.Misplaced, path: '/st-scan-menurouter/st-scan-misplaced' },
  { filter: STStatus.Excess, path: '/st-scan-menurouter/st-scan-excess' },
  { filter: STStatus.NoAccess, path: '/st-scan-menurouter/st-scan-noaccess' },
  { filter: STStatus.NotRegistered, path: '/st-scan-menurouter/st-scan-notregistered' },
];
  
export const DISPLAY_STBAL_SETTING_KEY = 'IsDisplaySTBalHH';

export const EditableSTListTypes = [
  STStatus.Found, STStatus.Misplaced
];

export const ShowItemInfoListTypes = [
  STStatus.Pending
];

export const DeletableSTListTypes = [
  STStatus.Misplaced
];
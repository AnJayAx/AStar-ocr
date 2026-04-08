export enum RVLists { 
    Pending = 'Pending',
    Found = 'Found',
    Excess = 'Excess'
};

export const ListPageMap = [
    { id: RVLists.Pending, path: '/rv-taglist-menurouter/rv-taglist-pending' },
    { id: RVLists.Found, path: '/rv-taglist-menurouter/rv-taglist-found' },
    { id: RVLists.Excess, path: '/rv-taglist-menurouter/rv-taglist-excess' }
];

export enum RVSubmitStatus {
    Verify_Partial = 'WIP_Verify',
    Verify_Done = 'Completed',
    Receive_Partial = 'WIP_Receive',
    Receive_Done = 'Received'
};

export enum RVSubmitItemStatus {
    Verify_Partial = 'Partial Verify',
    Verify_Done = 'Verified',
    Receive_Partial = 'Partial Receive',
    Receive_Done = 'Received'
};
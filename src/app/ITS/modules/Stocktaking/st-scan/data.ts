import { ScanStatistic } from "@its/shared/interfaces/frontend/ScanStatistic"
import { STStatus } from "../stocktaking.constants";

enum SmStatus {
    NA = 0, /* Not applicable */
    Init = 0,   /* Initial status */
    Single = 0,
    Multiple = 1,
}

export const Colours = {
    totalbg: 'rgb(212,229,246)',
    totaltext: 'rgb(64,120,179)',
    
    foundbg: 'rgb(211,242,218)',
    foundtext: 'rgb(67,181,80)',
    
    misplacedbg: 'rgb(246,208,222)',
    misplacedtext: 'rgb(199,6,3)',
    
    excessbg: 'rgb(254,186,49)',
    excesstext: 'white',
    
    noaccessbg: 'rgb(236,236,234)',
    noaccesstext: 'rgb(11,50,145)',
    
    notregisteredbg: 'rgb(168,171,168)',
    notregisteredtext: 'white',
};

export const DEFAULT_SCANMENU: ScanStatistic[] = [
    { 
        statName: 'TOTAL',
        statFilter: STStatus.Pending,
        statNumber: 0, 
        statusCode: SmStatus.Init, 
        bgColor: Colours.totalbg, fontColor: Colours.totaltext,
        detailsPageLink: 'st-scan-menurouter/st-scan-overview',
    },
    { 
        statName: 'FOUND', 
        statFilter: STStatus.Found,
        statNumber: 0, 
        statusCode: SmStatus.Init, 
        bgColor: Colours.foundbg, fontColor: Colours.foundtext,
        detailsPageLink: 'st-scan-menurouter/st-scan-found',
    },
    { 
        statName: 'MISPLACED', 
        statFilter: STStatus.Misplaced,
        statNumber: 0, 
        statusCode: SmStatus.NA, 
        bgColor: Colours.misplacedbg, fontColor: Colours.misplacedtext,
        detailsPageLink: 'st-scan-menurouter/st-scan-misplaced',
    },
    { 
        statName: 'EXCESS', 
        statFilter: STStatus.Excess,
        statNumber: 0, 
        statusCode: SmStatus.NA, 
        bgColor: Colours.excessbg, fontColor: Colours.excesstext,
        detailsPageLink: 'st-scan-menurouter/st-scan-excess',
    },
    { 
        statName: 'NO ACCESS', 
        statFilter: STStatus.NoAccess,
        statNumber: 0, 
        statusCode: SmStatus.NA, 
        bgColor: Colours.noaccessbg, fontColor: Colours.noaccesstext,
        detailsPageLink: 'st-scan-menurouter/st-scan-noaccess',
    },
    { 
        statName: 'NOT REGISTERED', 
        statFilter: STStatus.NotRegistered,
        statNumber: 0, 
        statusCode: SmStatus.NA, 
        bgColor: Colours.notregisteredbg, fontColor: Colours.notregisteredtext, 
        detailsPageLink: 'st-scan-menurouter/st-scan-notregistered',
    }
];
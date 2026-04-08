import { RoleTypes } from '@dis/auth/roles.enum';
import { faArrowRightArrowLeft, faBoxOpen, faBoxesStacked, faCartShopping, faCheckToSlot, faClipboardList, faCodeMerge, faCubes, faDolly, faDumpster, faListCheck, faPassport, faPlus, faRecycle, faScrewdriverWrench, faTag, faWarehouse, faInbox, faEye } from '@fortawesome/free-solid-svg-icons';
// Will allow show/hide of links in sidebar when sign-on flow is implemented

export const config = [
  // Add navigation group here
  {
      group: 'Main Menu',
      items: [
        {
          name: 'Registration',
          faIcon: faPlus,
          link: './registration',
          elevation: []
        },
        {
          name: 'Update',
          icon: 'edit',
          link: './update',
          elevation: []
        },
        {
          name: 'Check In/Out',
          faIcon: faArrowRightArrowLeft,
          link: './checkinout',
          elevation: []
        },
        {
          name: 'LoanReturn',
          faIcon: faListCheck,
          link: './loanreturn',
          elevation: []
        },
        {
          name: 'Relocation',
          faIcon: faDolly,
          link: './relocation',
          elevation: []
        },
        {
          name: 'Audit',
          faIcon: faClipboardList,
          link: './audit',
          elevation: []
        },
        {
          name: 'MRO',
          icon: 'wrench',
          link: './mro',
          elevation: []
        },
        {
          name: 'Stock Taking',
          faIcon: faWarehouse,
          link: './st-details',
          elevation: []
        },
        {
          name: 'Picking List',
          faIcon: faCartShopping,
          link: './pl-list',
          elevation: []
        },
        {
          name: 'Check Status',
          icon: 'info',
          link: './checkstatus',
          elevation: []
        },
        {
          name: 'Scrap',
          icon: 'trash',
          link: './scrap',
          elevation: []
        },
        {
          name: 'Locating',
          icon: 'search',
          link: './loc-search',
          elevation: []
        },
        {
          name: 'Update with Tag ID',
          faIcon: faTag,
          link: './update-tag-id',
          elevation: []
        },
        {
          name: 'Container Relocation',
          icon: 'arrows-move',
          elevation: []
        },
        {
          name: 'Container Stock Taking',
          faIcon: faBoxesStacked,
          elevation: []
        },
        {
          name: 'Put In/Take Out',
          faIcon: faBoxOpen,
          elevation: []
        },
        {
          name: 'Receiving',
          icon: 'inbox',
          link: './rv-list',
          elevation: []
        },
        {
          name: 'Split',
          faIcon: faCubes,
          link: './is-scan',
          elevation: []
        },
        {
          name: 'GR Verify',
          faIcon: faCheckToSlot,
          link: './gr-verify',
          elevation: []
        },
        {
          name: 'Refurbishment',
          faIcon: faScrewdriverWrench,
          link: './rb-scan',
          elevation: []
        },
        {
          name: 'Production Traveler',
          faIcon: faPassport,
          link: './pt-op-select',
          elevation: []
        },
        {
          name: 'Write Off',
          faIcon: faDumpster,
          link: './writeoff',
          elevation: []
        },
        {
          name: 'Stock Merge',
          faIcon: faCodeMerge,
          link: './sm-merge-to',
          elevation: []
        },
        {
          name: 'Tag Reuse',
          faIcon: faRecycle,         
          link: './tr-scan',
          elevation: []
        }, 
        {
          name: 'Production Receive',
          icon: 'track-changes-accept',
          link: './productreceive',
          elevation: []
        },
        {
          name: 'OCR',
          faIcon: faEye,         
          link: './ocr',
          elevation: []
        }, 
      ]
    }
];

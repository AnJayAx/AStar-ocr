import { Component, OnDestroy, OnInit } from '@angular/core';
import { config  as CONFIG} from "@dis/settings/sidebar.config";
import {Router} from "@angular/router";
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Subject } from 'rxjs';
import { ISidebarItem, ISidebarItemItem } from '@its/shared/interfaces/frontend/SidebarItem';
import { ToastService } from '@dis/services/message/toast.service';
import { MainmenuService } from '@its/mainmenu/services/mainmenu.service';
import { RefreshService } from '@its/shared/services/refresh.service';
import { PlResetService } from '@its/modules/PickingList/services/pl-reset.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { UpdateTagidStoreService } from '@its/modules/UpdateTagId/services/update-tagid-store.service';
import { GrVerifyStoreService } from '@its/modules/GRVerify/services/gr-verify-store.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { WriteOffStoreService } from '@its/modules/WriteOff/services/write-off-store.service';
import { StResetService } from '@its/modules/Stocktaking/services/st-reset.service';
import { RvOrderService } from '@its/modules/ReceiveVerify/services/rv-order.service';

@Component({
  selector: 'app-main-menu-new',
  templateUrl: './main-menu-new.component.html',
  styleUrls: ['./main-menu-new.component.scss']
})
export class MainMenuNewComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  // items: any = [...CONFIG];
  items: ISidebarItem[];
  
  constructor(
    private router: Router,
    private _tagsService: ScannedTagsService,
    private _toast: ToastService,
    private _mainmenuService: MainmenuService,
    private _refresh: RefreshService,
    private _layoutService: LayoutService,
    
    private _commondata: CommonDataService,
    private _commonstore: CommonStoreService,
    
    private _plresetService: PlResetService,
    private _updatetagidstoreService: UpdateTagidStoreService,
    private _grverifyStoreService: GrVerifyStoreService,
    private _stresetService: StResetService,
    private _writeoffStoreService: WriteOffStoreService,
    private _rvorderService: RvOrderService,
  ) {
    /* Update stored values */
    this._commondata.blockchainConnectionEnabled$.subscribe({ next: (bcConnected) => this._commonstore.updateBlockchainConnectionEnabledState(bcConnected) });
    this._commondata.inboundVerifyStatus$.subscribe({ next: (ibStatus) => this._commonstore.updateInboundVerifyStatusState(ibStatus) });
    this._commondata.inboundVerifyValue$.subscribe({ next: (ibValue) => this._commonstore.updateInboundVerifyValueState(ibValue) });
    this._commondata.serverUser$.subscribe({ next: (user) => this._commonstore.updateServerUserState(user) });
    this._commondata.userCompany$.subscribe({ next: (company) => this._commonstore.updateUserCompanyState(company) });

    this._mainmenuService.getUserModules().subscribe({
      next: (menuItems) => { 
        this.items = menuItems; 
        console.log('[main-menu-new] MENU ITEMS', this.items);
      },
      error: (error) => {
        console.error(error);
        alert('Unable to obtain user-assigned modules');
      }
    });

    this._layoutService.setDefaultTitleDisplay();
  }

  ngOnInit(): void {   
    /* for future ref on making dial items with floating button
    var len = config[0].items.length;
    for (let i = 0; i < len; i++) {
      console.log(config[0].items[i].name);
      this.itemsList.push(
        {label: config[0].items[i].name}
      );
    }
    */

    /* Tags are reset before entry into each module */
    this._tagsService.resetTagsService();
    
    /* Reset modules before entry into each module (where necessary) */
    this._plresetService.resetAndDestroyPlModule();
    this._updatetagidstoreService.resetUpdateTagIdStore();
    this._grverifyStoreService.resetStore();
    this._stresetService.resetAndDestroyStModule();
    this._writeoffStoreService.resetStates();
    this._rvorderService.reset();
  }

  navigate(item: ISidebarItemItem) {
    console.log(item.link);
    if (item.link?.length > 0) {
      this.router.navigate([item.link]);
      this._layoutService.changeTitleDisplay(item.name);
    } else {
      this._toast.warning('No link found for menu item');
    }
  }

  showList() {
    this.router.navigate(['/mainmenunew-list']);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

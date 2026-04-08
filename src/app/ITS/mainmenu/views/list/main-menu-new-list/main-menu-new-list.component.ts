import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { config  as CONFIG} from "@dis/settings/sidebar.config";
import { ISidebarItem, ISidebarItemItem } from '@its/shared/interfaces/frontend/SidebarItem';
import { MainmenuService } from '@its/mainmenu/services/mainmenu.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@dis/services/message/toast.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-mainmenunew-list',
  templateUrl: './main-menu-new-list.component.html',
  styleUrls: ['./main-menu-new-list.component.scss']
})
export class MainMenuNewListComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();

  toRvList() {
    this.router.navigate(['rv-list']);
  }
  // items: ISidebarItem[] = [...config];
  items: ISidebarItem[];

  constructor(
    private router: Router,
    private _mainmenuService: MainmenuService,
    private _toast: ToastService,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
  ) {
    this._mainmenuService.getUserModules().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (menuItems) => { 
        this.items = menuItems;
        this.ref.detectChanges();
      }
    });

    this._layoutService.setDefaultTitleDisplay();
  }

  ngOnInit(): void {}

  navigate(item: ISidebarItemItem): void {
    console.log(item.link);
    if (item.link?.length > 0) {
      this.router.navigate([item.link]);
      this._layoutService.changeTitleDisplay(item.name);
    } else {
      this._toast.warning('No link found for menu item');
    }
  }

  returnToMainMenu() {
    this.router.navigate(['/mainmenunew']);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

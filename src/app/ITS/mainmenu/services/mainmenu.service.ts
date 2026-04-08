import { Injectable } from '@angular/core';
import { ISidebarItem, ISidebarItemItem } from '@its/shared/interfaces/frontend/SidebarItem';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { map, Observable } from 'rxjs';
import { config as CONFIG} from "@dis/settings/sidebar.config";
import { IModule } from '@its/shared/interfaces/backend/Module';

@Injectable({
  providedIn: 'root'
})
export class MainmenuService {
  constructor(
    private _itsService: ItsServiceService
  ) { }

  getUserModules(): Observable<ISidebarItem[]> {
    return this._itsService.getAssignedMobileUserModulesByUserName()
      .pipe(
        map(modules => this.getUserMenuItemsFromModules(modules))
      );
  }

  private getUserMenuItemsFromModules(modules: IModule[]): ISidebarItem[] {
    function getModuleName(moduleDisplayName: string): string {
      console.log('[mainmenu svc] getModuleName name', moduleDisplayName.replace('AHCS - ', '').toLowerCase().replace(/\s/g, ""));
      return moduleDisplayName.replace('AHCS - ', '').toLowerCase().replace(/\s/g, "");
    }

    const moduleNames = modules.map(m => getModuleName(m.module_display_name));
    const configMenuItems: ISidebarItemItem[] = CONFIG[0].items;
    const assignedMenuItems: ISidebarItemItem[]  = []

    /* traverse module names in order to allow control of menu item chronology from backend */
    for (let i=0; i<moduleNames.length; i++) {
      const configMenuItem = configMenuItems.find(item => item.name.toLowerCase().replace(/\s/g, "") === moduleNames[i])
      if (!!configMenuItem) {
        assignedMenuItems.push(configMenuItem);
      } else {
        console.warn('No config menu item found for module name', moduleNames[i]);
      }
    }

    return [{
      "group": CONFIG[0].group,
      "items": assignedMenuItems
    }] as ISidebarItem[];

    // CONFIG.forEach(config => {
    //   const newMenuItem: ISidebarItem = {
    //     "group": config.group,
    //     "items": config.items.filter(item => moduleNames.includes(item.name.toLowerCase().replace(/\s/g, "")))
    //   };
    //   items.push(newMenuItem);
    // });
    // return items;
  }

}

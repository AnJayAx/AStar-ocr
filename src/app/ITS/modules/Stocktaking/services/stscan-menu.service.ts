import { Injectable } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { ScanStatistic } from '@its/shared/interfaces/frontend/ScanStatistic';

@Injectable()
export class StScanMenuService {

  constructor() {}

  updateMenu(props: { total: ISTItem[], found: ISTItem[], misplaced: ISTItem[], excess: ISTItem[], noaccess: ISTItem[], notregistered: ISTItem[] }, currMenu:ScanStatistic[]) : ScanStatistic[] {
    let menu = currMenu;
    const updateMenuItemNum = (name: string, updatedSTItemArr: ISTItem[]) => {
      const updatedNum = updatedSTItemArr.length;
      const updatedArr = menu.map((item) => item.statName === name ? {...item, statNumber: updatedNum} : item);
      menu = [...updatedArr];
    }

    const updateMenuItemIndicator = (name: string, updatedSTItemArr: ISTItem[]) => {
      const checkForMultipleItems = (stItemArr: ISTItem[]) => {
        const smArr = stItemArr.map(x => x.SM?.toUpperCase());
        if (smArr.length > 0 && smArr.includes('M')) return true;
        return false;
      }
      const checkForUndefinedQtys = (stItemArr: ISTItem[]) => {
        const stQtyArr = stItemArr.map(x => x.ST_Qty);
        if (stQtyArr.length > 0 && stQtyArr.some(x => !Number.isFinite(x))) return true;
        return false;
      }
      const updatedCode = checkForUndefinedQtys(updatedSTItemArr) ? 1 : checkForMultipleItems(updatedSTItemArr) ? 2 : 0;
      const updatedArr = menu.map((item) => item.statName === name ? {...item, statusCode: updatedCode} : item);
      menu = [...updatedArr];
    }

    updateMenuItemNum('TOTAL', props.total);
    updateMenuItemNum('FOUND', props.found);
    updateMenuItemNum('MISPLACED', props.misplaced);
    updateMenuItemNum('EXCESS', props.excess);
    updateMenuItemNum('NO ACCESS', props.noaccess);
    updateMenuItemNum('NOT REGISTERED', props.notregistered);

    updateMenuItemIndicator('FOUND', props.found);

    return menu;
  }
}

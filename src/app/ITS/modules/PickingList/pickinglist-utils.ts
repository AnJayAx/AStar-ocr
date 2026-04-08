import { IItemInfo } from "@its/shared/interfaces/backend/ItemInfo";
import { IPickedLine, IPLOrder } from "@its/shared/interfaces/backend/PLOrder";
import { IPLListItem, IPLRefLocation } from "@its/shared/interfaces/frontend/PLListItem";
import { IPLOrderItem } from "@its/shared/interfaces/frontend/PLOrderItem";
import { IPLTagItem } from "@its/shared/interfaces/frontend/PLTagItem";

export class PickingListUtils {
    public static getPickingID(listItem: IPLListItem | IItemInfo): string {
      const suffixType = this.getPickingSuffixType(listItem);
      let listItemBaseId = this.getPickingBaseID(listItem);

      if (suffixType === 'batchno') return `${listItemBaseId}/${listItem.BatchNo}`;
      if (suffixType === 'expirydate') return `${listItemBaseId}/${listItem.Date_of_Expire}`;
      return `${listItemBaseId}`;
    }

    /* ignores batchno and expirydate values and matches by baseId */
    // public static isMatchingScanItemByBase(listItem: IPLListItem, scanItem: IItemInfo): boolean {
    //   const listItemId = this.getPickingBaseID(listItem);
    //   const scanItemId = this.getPickingBaseID(scanItem);
    //   // console.log(`
    //   //   isMatchingScanItemByBase? ${listItemId === scanItemId}
    //   //   - listItemId = ${listItemId},
    //   //   - scanItemId = ${scanItemId},
    //   // `);
    //   return listItemId === scanItemId;
    // }    

    /* accounts for batchno and expirydate values, if any, in matching IDs */
    public static isMatchingScanItem(listItem: IPLListItem, scanItem: IItemInfo): boolean {
      const listSuffixType = this.getPickingSuffixType(listItem);

      const listItemId: string = this.getPickingID(listItem);

      let scanItemBaseId = this.getPickingBaseID(scanItem);
      // let scanItemId: string = this.getPickingID(scanItem);
      let scanItemId: string = "";

      /* generate scanItemId based on listSuffixType for matching */
      switch (listSuffixType) {
        case 'batchno':
          scanItemId = scanItem.BatchNo?.toString().length > 0 ? `${scanItemBaseId}/${scanItem.BatchNo}` : `${scanItemBaseId}`;
          break;
        case 'expirydate':
          scanItemId = scanItem.Date_of_ExpireS?.length > 0 ? `${scanItemBaseId}/${scanItem.Date_of_ExpireS}` : `${scanItemBaseId}`;
          break;
        case 'none':
          scanItemId = `${scanItemBaseId}`; 
          break;
        default:
          console.error('Error occurred in isMatchingScanItem');
      }

      return listItemId === scanItemId;
    }

    private static getPickingSuffixType(listItem: IPLListItem | IItemInfo): 'batchno' | 'expirydate' | 'none' {
      const suffixType = listItem.BatchNo?.toString().length > 0 ? 'batchno' : listItem.Date_of_Expire?.toString().length > 0 ? 'expirydate' : 'none';
      return suffixType;
    }

    private static getPickingBaseID(item: IPLListItem | IItemInfo): string {
      const baseId = (!item.SKU || item.SKU.length == 0) ?
      `${item.Category}/${item.Description}` :
      `${item.Category}/${item.Description}/${item.SKU}`;

      return baseId;
    }
    
    public static getOverallPickedQtyFromPickedLines(pickedLines: IPickedLine[]): number {
        if (pickedLines.length === 0) { return 0; }
        const qty = pickedLines.reduce((total, pickedLine) => total + pickedLine.Qty, 0);
        return qty;
    }
    public static getOverallPickedQtyFromTagItems(tagItems: IPLTagItem[]): number {
        if (tagItems.length === 0) { return 0; }
        const qty = tagItems.reduce((total, tagItem) => total + tagItem._picked, 0);
        return qty;
    }

    public static isMItemDetected(pickedItems: IPLTagItem[]): boolean {
        const statusArr = pickedItems.map(item => item.IsIndividual.toLowerCase());
        if (statusArr.includes('m') || statusArr.includes('false')) { return true; }    /* handle both sm or true/false values */
        return false;
    }

    /* initializing orderItem */
    public static orderToOrderItem(order: IPLOrder): IPLOrderItem {
      function parseRefLocations(locations: string): IPLRefLocation[] {
          if (locations === "" || !locations) { return []; }

          const refLocs: IPLRefLocation[] = [];
          // const locs = locations.split(',');

          // Split the string based on comma and space, except when within parentheses
          const locs = locations.split(/,\s(?![^(]*\))/);

          locs.forEach(loc => {
            const loc_trimmed = loc.trim();
            const openBracIdx = loc_trimmed.indexOf('(');
            const closeBracIdx = loc_trimmed.indexOf(')');
            const qty = parseFloat(loc_trimmed.substring(openBracIdx+1, closeBracIdx));
      
            const locName = loc_trimmed.substring(0, openBracIdx).trim();
      
            const refLoc: IPLRefLocation = {
              "Location_Name": locName,
              "Qty": qty
            };
            refLocs.push(refLoc);
          });
          return refLocs;
      }

      const orderType = order.isNormalPicking ? 'PDO' : 'PT';
      let orderItem: IPLOrderItem = {
          "Verification_ID": order.Verification_ID,
          "Order_No": order.Order_No,
          "Display_ID": order.Display_ID,
          "IsNormalPicking": order.isNormalPicking,
          "Status": order.Status,
          "Label": `${order.Order_No} (${orderType}/${order.Status})`,
          "Customer_ID": order.Customer_ID,
          "PickingList": []
      }

      order.Lines.forEach(line => {
          const qty = line.Qty;
          const picked = this.getOverallPickedQtyFromPickedLines(line.PickedLines);

          /* Only include unpicked or partially-picked items */
          if (picked >= qty) { return; }

          let listItem: IPLListItem = {
              "Verification_ID": line.Verification_ID,
              "Display_ID": line.Display_ID,
              "Order_No": order.Order_No,
              "PickingList_ID": line.PickingList_ID,
              "Category": line.Category,
              "Description": line.Description,
              "SKU": line.SKU,
              "Location": parseRefLocations(line.Ref_Loc),
              "Qty": qty,
              "UOM": line.UOM,
              "BatchNo": line.BatchNo,
              "Date_of_Expire": line.Date_of_Expire,

              // "TagItems":line.PickedLines.map(line => this.getTagItemFromPickedLine(line)),
              "TagItems": [], /* initialize with no tag items, tag items are created from scans */

              "_id": undefined,
              "_picked": picked,
              "_mDetected": false,    /* default value */
              "_remainingQty": qty - picked
          };
          listItem['_id'] = PickingListUtils.getPickingID(listItem);
          orderItem.PickingList.push(listItem);
      });

      return orderItem;
    }

    public static getNewTagItem(scanItem: IItemInfo, listItem: IPLListItem, isMFullyPicked: boolean): IPLTagItem {
      function getDefaultPickedQty(): number {
        if (scanItem.LastBal > 0) {
          if (scanItem.IsIndividual.toLowerCase() === 'm' && isMFullyPicked===true) {
            const qtyToPick = listItem._remainingQty;
            const qtyPickable = scanItem.LastBal < qtyToPick ? scanItem.LastBal : qtyToPick;
            return qtyPickable;
          }

          else if (scanItem.IsIndividual.toLowerCase() === 's') {
            return 1;
          }

          return null;
        }

        return 0;
      }

      const defaultPickedQty = getDefaultPickedQty();
      console.log('DEBUG get defaultPickedQty', defaultPickedQty);
      const tagItem: IPLTagItem = {
          "Verification_ID": listItem.Verification_ID,
          "PickingList_ID": listItem.PickingList_ID,
          "Display_ID": listItem.Display_ID,
          "Asset_ID": scanItem.Asset_ID,
          "Status": scanItem.Asset_StatusName,
    
          "IsIndividual": scanItem.IsIndividual,
          "Category": scanItem.Category,
          "Description": scanItem.Description,
          "Date_of_Expire": scanItem.Date_of_Expire,
          "BatchNo": scanItem.BatchNo,
          "SKU": scanItem.SKU,
          "EPC_ID": scanItem.EPC_ID,
          "Qty": listItem.Qty,
          "LastBal": scanItem.LastBal,
    
          "_id": PickingListUtils.getPickingID(listItem),
          "_location": scanItem.Asset_LocationLocation,
          "_picked": defaultPickedQty,
          "_balance": scanItem.LastBal - defaultPickedQty
      };
      return tagItem;
    }

    public static getUpdatedRemainingQty(listItem: IPLListItem): number {
        return listItem.Qty - listItem._picked;
    }
  }
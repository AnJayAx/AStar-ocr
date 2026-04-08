import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { Filesystem } from "@capacitor/filesystem";
import { from, Observable, of } from "rxjs";
import { IItemInfo } from "../interfaces/backend/ItemInfo";
import { IItsSetting } from "../interfaces/backend/ItsSetting";
import { ISelectedTag } from "../interfaces/frontend/selectedTags";

export class Utils {

    /**
     * Project-specific
     */
    public static getSingleITSSettingVal(itsSettingRes: IItsSetting[]): string {
        return itsSettingRes[0].ITSValue;
    }

    public static filesToBase64(filePaths: string[]): Observable<string[]> {
      function blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error);
          reader.onloadend = () => {
            const dataUrl = String(reader.result ?? '');
            const commaIndex = dataUrl.indexOf(',');
            resolve(commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl);
          };
          reader.readAsDataURL(blob);
        });
      }

      function getBase64(path: string): Promise<string> {
        return Filesystem.readFile({ path }).then(async (result) => {
          return typeof result.data === 'string' ? result.data : await blobToBase64(result.data);
        });
      };

        function getBase64FromFiles(filePaths: string[]): Promise<string[]> {
            const base64Promises = filePaths.map(path => getBase64(path));
            return Promise.all(base64Promises);
        }

        return from(getBase64FromFiles(filePaths));
    }

    /* from https://github.com/capacitor-community/barcode-scanner */
    public static async didUserGrantCameraPermission(): Promise<boolean> {
        // check if user already granted permission
        const status = await BarcodeScanner.checkPermission({ force: false });
        console.log('status', status);
      
        if (status.granted) {
          // user granted permission
          return true;
        }
      
        if (status.denied) {
          // user denied permission
          const c = confirm('Grant camera permissions in the app settings.');
          if (c) {
            BarcodeScanner.openAppSettings();
          }
          return false;
        }
      
        if (status.asked) {
          // system requested the user for permission during this call
          // only possible when force set to true
        }
      
        if (status.neverAsked) {
          // user has not been requested this permission before
          // it is advised to show the user some sort of prompt
          // this way you will not waste your only chance to ask for the permission
          const c = confirm('We need your permission to use your camera to be able to scan barcodes');
          if (!c) {
            return false;
          }
        }
      
        if (status.restricted || status.unknown) {
          // ios only
          // probably means the permission has been denied
          return false;
        }
      
        // user has not denied permission
        // but the user also has not yet granted the permission
        // so request it
        const statusRequest = await BarcodeScanner.checkPermission({ force: true });
      
        if (statusRequest.asked) {
          // system requested the user for permission during this call
          // only possible when force set to true
        }
      
        if (statusRequest.granted) {
          // the user did grant the permission now
          return true;
        }
      
        // user did not grant the permission, so he must have declined the request
        return false;
    }

    public static ItemInfoToTag(itemInfoObject: IItemInfo): ISelectedTag {
      return {
        "EPC_ID": itemInfoObject.EPC_ID,
        "SM": itemInfoObject.IsIndividual,
        "Category": itemInfoObject.Category,
        "Asset_ID": itemInfoObject.Asset_ID.toString(),
        "Asset_No": itemInfoObject.Asset_No,
        "Description": itemInfoObject.Description,
        "Asset_LocationLocation": itemInfoObject.Asset_LocationLocation,
        "LastBal": itemInfoObject.LastBal,
        "Asset_StatusName": itemInfoObject.Asset_StatusName,
        "Submitting_Amount": itemInfoObject.LastBal,
        "ReceiveQty": Number(itemInfoObject.Remarks6),
      };
    }
  


    /**
     * Generic
     */
    public static groupByKey<T, K>(objArr: T[], getKey: (item: T) => K) {
        const map = new Map<K, T[]>();
        objArr.forEach((item) => {
            const key = getKey(item);
            const collection = map.get(key);
            if (!collection) { map.set(key, [item]); }
            else { collection.push(item); }
        });
        return Array.from(map.values());
    }

    public static removeNullValue(value: any) {
        return value === null ? "" : value;
    }
    
    public static formatDateString(dateObjectToDateString: string) {
      if (dateObjectToDateString !== "" && !!dateObjectToDateString) {
        var dateArray = dateObjectToDateString.split(" ");
        var result = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[3];
        return result;
      } else {
        return dateObjectToDateString;
      }
    }

    public static getImageBase64Source(base64Data: string): string {
        return `data:image/png;base64,${base64Data}`;
    }

    public static imageToBase64(images: File[]): Observable<string[]> {

        function getBase64(file: File): Promise<string> {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
            });
          }
          
        function getBase64FromFiles(files: File[]): Promise<string[]> {
            const base64Promises = files.map(file => getBase64(file));
            return Promise.all(base64Promises);
        }

        return from(getBase64FromFiles(images));
    }

    public static normalized(s: string): string {
      return s.replace(/\s/g,'').toLowerCase();
    }

    public static getUnorderedListHTML(list: string[]): string {
      let html = "<ul>\n";
      list.forEach(string => {
        html += `<li>${string}</li>\n`;
      });
      html += "</ul>";
      return html;
    }
}
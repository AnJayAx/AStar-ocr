import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { UpdateItem } from '@its/shared/interfaces/frontend/updateItem';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UpdateService } from '../update.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '@its/shared/classes/utils';
import { IDataBindings } from '@its/shared/interfaces/backend/databindings';
import { LayoutService } from '@dis/services/layout/layout.service';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { CommonDataService } from '@its/shared/services/common-data.service';

@Component({
  selector: 'app-update2-form',
  templateUrl: './update2-form.component.html',
  styleUrls: ['./update2-form.component.scss'],
  providers: [UpdateService]
})
export class Update2FormComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  inboundVerifyValue = this._commondataService.inboundVerifyValue$;
  
  isMultipleItems: boolean = false;
  itemNotFound: boolean = false;

  /* single item selected */
  item: IItemInfo;
  itemAssetId: string;  

  /* multiple items selected */
  itemArr: IItemInfo[];
  itemAssetIdArr: string[]; 

  isLoading: boolean = true;

  showSubmissionPanel: boolean = false;

  public updateform: FormGroup = new FormGroup({
    desc: new FormControl(""), 
    assetno: new FormControl(),
    loc: new FormControl(""),
    refno: new FormControl(""),
    sku: new FormControl(""),
    uom: new FormControl(""),
    batchno: new FormControl(""),
    dop: new FormControl(""),
    doe: new FormControl(null),
    dowe: new FormControl(null),
    doc: new FormControl(null),
    cost: new FormControl(null),
    rmk: new FormControl(""),
    rmk2: new FormControl(""),
    rmk3: new FormControl(""),
    rmk4: new FormControl(""),
    rmk5: new FormControl(""),
    rmk6: new FormControl(""),

    status: new FormControl(""),
    lastbal: new FormControl(""),
  });
  
  formfieldTitlesDictionary: { [db: string]: string } = {};
  locationsList: any[] = [];
  locationsDictionary: { [name: string]: number } = {};

  isQcToggled: boolean;

  constructor(
    private _itsService: ItsServiceService,
    private _updateService: UpdateService,
    private _itsdialog: ItsDialogService,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
    private _commonstore: CommonStoreService,
    private _commondataService: CommonDataService,
   ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Update Item', 'update');
   }

  private getDataBindingsAPI() {
    this._itsService.getDataBinding().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (dataBindings: IDataBindings[]) => {
        for (var i = 0; i < dataBindings.length; i++) {
          this.formfieldTitlesDictionary[dataBindings[i].DB_Field] = dataBindings[i].HH_Display_Name;
        }
      }
    });
  }

  private getLocationsAPI() {
    this._itsService.getLocations().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (locations) => {
        for (var i = 0; i < locations.length; i++) {
          var locationName = locations[i].Name;
          var locationId = locations[i].Asset_Location_ID;
          this.locationsList[i] = locationName;
          this.locationsDictionary[locationName] = locationId;
        }
      },
      error: (error) => { console.error(error); }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.destroyed$),
      map(params => {
        const isMultipleEPCs = params.get('epcs').split(',').length > 1;
        const isMultipleAssetIds = params.get('assetIds').split(',').length > 1;
        return isMultipleEPCs && isMultipleAssetIds;
      })
    ).subscribe({
      next: (isMultiple) => {
        this.isMultipleItems = isMultiple;
        this.ref.detectChanges();

        if (!this.isMultipleItems) {
          this.updateform.get('desc').setValidators(Validators.required);
          this.updateform.get('desc').updateValueAndValidity();

          this.updateform.get('dop').setValidators(Validators.required);
          this.updateform.get('dop').updateValueAndValidity();

          this.updateform.get('loc').setValidators(Validators.required);
          this.updateform.get('loc').updateValueAndValidity();
        }
      }
    });

    this.route.queryParamMap.pipe(
      takeUntil(this.destroyed$),
      switchMap((params) => {
        const epcArr: string[] = params.get('epcs').split(',');
        const epcParamArr: IEpcId[] = epcArr.map(epc => { return {"EPC_ID": epc} });
        return this._itsService.postItemsByEpcId(epcParamArr)
      })
    ).subscribe({
      next: (itemInfoArr) => {
        console.log('Selected items', itemInfoArr);
        if (itemInfoArr.length === 1) {          
          this.item = itemInfoArr[0];

          /* load default values in form fields */
          this.updateform.controls['desc'].setValue(this.item.Description);
          this.updateform.controls['assetno'].setValue(this.item.Asset_No);
          this.updateform.controls['sku'].setValue(this.item.SKU);
          this.updateform.controls['loc'].setValue(this.item.Asset_LocationLocation);
          this.updateform.controls['refno'].setValue(this.item.Ref_No);
          
          const dopDate = this.item.Date_of_Purchase?.length>0 ? new Date(this.item.Date_of_Purchase) : null;
          this.updateform.controls['dop'].setValue(dopDate);

          const doeDate = this.item.Date_of_Expire?.length>0 ? new Date(this.item.Date_of_Expire) : null;
          this.updateform.controls['doe'].setValue(doeDate);

          const doweDate = this.item.Warranty_Expiry_Date?.length>0? new Date(this.item.Warranty_Expiry_Date) : null;
          this.updateform.controls['dowe'].setValue(doweDate);

          const docDate = this.item.Calibration_Date?.length>0 ? new Date(this.item.Calibration_Date) : null;
          this.updateform.controls['doc'].setValue(docDate);

          this.updateform.controls['cost'].setValue(this.item.Cost);
          this.updateform.controls['uom'].setValue(this.item.UOM);
          this.updateform.controls['batchno'].setValue(this.item.BatchNo);
          
          this.updateform.controls['rmk'].setValue(this.item.Remarks);
          this.isQcToggled = this._commonstore.verifyValueToToggle(this.item.Remarks);  /* set single item's verify value */
          
          this.updateform.controls['rmk2'].setValue(this.item.Remarks2);
          this.updateform.controls['rmk3'].setValue(this.item.Remarks3);
          this.updateform.controls['rmk4'].setValue(this.item.Remarks4);
          this.updateform.controls['rmk5'].setValue(this.item.Remarks5);
          this.updateform.controls['rmk6'].setValue(this.item.Remarks6);
        }
        else if (itemInfoArr.length > 1) {
          this.itemArr = itemInfoArr;
        }
        this.itemNotFound = itemInfoArr.length === 0;
        this.ref.detectChanges();
      },
      error: (error) => {
        this.itemNotFound = true;
        console.log(error);
      }
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (params) => {
        const itemAssetIds = params.get('assetIds').split(',');
        if (itemAssetIds.length === 0) { this.itemAssetId = ""; }
        else if (itemAssetIds.length === 1) { this.itemAssetId = itemAssetIds[0]; }
        else { this.itemAssetIdArr = itemAssetIds; } 
      }
    });

    this.getDataBindingsAPI();
    this.getLocationsAPI();
  }

  onVerifyToggleChange(isToggled: boolean): void {
    this.updateform.controls['rmk'].setValue(this._commonstore.toggleToVerifyValue(isToggled));
  }

  pressSubmit() {
    this.updateform.markAllAsTouched();
    
    if (this.updateform.invalid) {
      this._itsdialog.missingFormInformation().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('Missing form info dialog closed')
      });
    } else {
      this.showSubmissionPanel = true;
    }
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {

      const userid: string = this._itsService.getServerUserId().toString();

      /* only these fields are editable for multiple update items */
      const formDescription: string = Utils.removeNullValue(this.updateform.controls['desc'].value);
      const formRefNo: string = Utils.removeNullValue(this.updateform.controls['refno'].value);
      const formSku: string = Utils.removeNullValue(this.updateform.controls['sku'].value);
      const formUom: string = Utils.removeNullValue(this.updateform.controls['uom'].value);
      const formBatchNo: string = Utils.removeNullValue(this.updateform.controls['batchno'].value);
      const formDoe: string = !!this.updateform.controls['doe'].value ? Utils.formatDateString(this.updateform.controls['doe'].value.toDateString()) : "";
      const formDop: string = !!this.updateform.controls['dop'].value ? Utils.formatDateString(this.updateform.controls['dop'].value.toDateString()) : "";
      const formDowe: string = !!this.updateform.controls['dowe'].value ? Utils.formatDateString(this.updateform.controls['dowe'].value.toDateString()) : "";
      const formDoc: string = !!this.updateform.controls['doc'].value ? Utils.formatDateString(this.updateform.controls['doc'].value.toDateString()) : "";
      const formCost: string = Utils.removeNullValue(this.updateform.controls['cost'].value).toString();
      const formRemarks: string = Utils.removeNullValue(this.updateform.controls['rmk'].value);
      const formRemarks2: string = Utils.removeNullValue(this.updateform.controls['rmk2'].value);
      const formRemarks3: string = Utils.removeNullValue(this.updateform.controls['rmk3'].value);
      const formRemarks4: string = Utils.removeNullValue(this.updateform.controls['rmk4'].value);
      const formRemarks5: string = Utils.removeNullValue(this.updateform.controls['rmk5'].value);
      const formRemarks6: string = Utils.removeNullValue(this.updateform.controls['rmk6'].value);
      
      if (this.isMultipleItems) {

        const updateObjects: UpdateItem[] = [];

        this.itemArr.forEach(item => {
          const updateObject: UpdateItem = {
            "EPC_ID": item.EPC_ID,
            "Asset_ID": Utils.removeNullValue(item.Asset_ID).toString(),
            "Category": Utils.removeNullValue(item.Category),
            "Asset_No": Utils.removeNullValue(item.Asset_No),
            "Description": formDescription.length>0 ? formDescription : Utils.removeNullValue(item.Description),
            "Ref_No": formRefNo.length>0 ? formRefNo : Utils.removeNullValue(item.Ref_No),
            "SKU": formSku.length>0 ? formSku : Utils.removeNullValue(item.SKU),
            "UOM": formUom.length>0 ? formUom : Utils.removeNullValue(item.UOM),
            "BatchNo": formBatchNo.length>0 ? formBatchNo : Utils.removeNullValue(item.BatchNo).toString(),
            "Date_of_Expire": formDoe.length>0 ? formDoe : Utils.removeNullValue(item.Date_of_Expire),
            "Date_of_Purchase": formDop.length>0 ? formDop : Utils.removeNullValue(item.Date_of_Purchase),
            "Warranty_Expiry_Date": formDowe.length>0 ? formDowe : Utils.removeNullValue(item.Warranty_Expiry_Date),
            "Calibration_Date": formDoc.length>0 ? formDoc : Utils.removeNullValue(item.Calibration_Date),
            "Cost": !!formCost ? formCost.toString() : Utils.removeNullValue(item.Cost).toString(),
            "Remarks": formRemarks.length>0 ? formRemarks : Utils.removeNullValue(item.Remarks),
            "Remarks2": formRemarks2.length>0 ? formRemarks2 : Utils.removeNullValue(item.Remarks2),
            "Remarks3": formRemarks3.length>0 ? formRemarks3 : Utils.removeNullValue(item.Remarks3),
            "Remarks4": formRemarks4.length>0 ? formRemarks4 : Utils.removeNullValue(item.Remarks4),
            "Remarks5": formRemarks5.length>0 ? formRemarks5 : Utils.removeNullValue(item.Remarks5),
            "Remarks6": formRemarks6.length>0 ? formRemarks6 : Utils.removeNullValue(item.Remarks6),
            "Asset_Location_ID": Utils.removeNullValue(item.Asset_Location_ID).toString(),
            "AssetLocation": Utils.removeNullValue(item.Asset_LocationLocation),
            "Asset_Status_ID": Utils.removeNullValue(item.Asset_Status_ID).toString(),
            "AssetStatus": Utils.removeNullValue(item.Asset_StatusName)
          };
          updateObjects.push(updateObject);
        });

        this._updateService.postUpdateArr(userid, updateObjects).subscribe({
          next: (response) => {
            console.log('Update posted', response);
            if (response.primary) {
              this._updateService.resetTags();
              this.router.navigate(['/update']);
            }
          }
        })
      }
      else {
        const updateObject: UpdateItem = {
          "EPC_ID": this.item.EPC_ID,
          "Asset_ID": Utils.removeNullValue(this.item.Asset_ID.toString()),
          "Category": Utils.removeNullValue(this.item.Category),
          "Asset_No": Utils.removeNullValue(this.updateform.controls['assetno'].value),
          "Description": formDescription,
          "Ref_No": formRefNo,
          "SKU": formSku,
          "UOM": formUom,
          "BatchNo": formBatchNo,
          "Date_of_Expire": formDoe,
          "Date_of_Purchase": formDop,
          "Warranty_Expiry_Date": formDowe,
          "Calibration_Date": formDoc,
          "Cost": formCost,
          "Remarks": formRemarks,
          "Remarks2": formRemarks2,
          "Remarks3": formRemarks3,
          "Remarks4": formRemarks4,
          "Remarks5": formRemarks5,
          "Remarks6": formRemarks6, 
          "Asset_Location_ID": Utils.removeNullValue(this.locationsDictionary[this.updateform.controls["loc"].value].toString()),
          "AssetLocation": Utils.removeNullValue(this.item.Asset_LocationLocation), 
          "Asset_Status_ID": Utils.removeNullValue(this.item.Asset_Status_ID.toString()),
          "AssetStatus": Utils.removeNullValue(this.item.Asset_StatusName), 
        };

        const assetId: number = this.item.Asset_ID;
        this._updateService.postUpdate(assetId, userid, updateObject).subscribe({
          next: (response) => {
            if (response.primary) {
              this._updateService.resetTags();
              this.router.navigate(['/update']);
            }
          }
        });   
      }
    } else {
      console.log('Submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

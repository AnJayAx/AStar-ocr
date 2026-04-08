import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';
import { Utils } from '@its/shared/classes/utils';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { IDataBindings } from '@its/shared/interfaces/backend/databindings';
import { IEpcId } from '@its/shared/interfaces/backend/EpcId';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { TagReuseItem } from '@its/shared/interfaces/backend/TagReuseItem';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { CommonStoreService } from '@its/shared/services/common-store.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { TagReuseService } from '../tag-reuse.service';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { ICategories } from '@its/shared/interfaces/backend/categories';

@Component({
  selector: 'app-tr-form',
  templateUrl: './tr-form.component.html',
  styleUrls: ['./tr-form.component.scss']
})
export class TrFormComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  inboundVerifyValue = this._commondataService.inboundVerifyValue$;
  
  itemNotFound: boolean = false;
  isLoading: boolean = true;
  showSubmissionPanel: boolean = false;

  item: IItemInfo;
  selectedLocation: ILocations; // For dropdown use
  selectedCategory: ICategories; // For dropdown use
  itemAssetId: string;  
  
  public tagReuseForm: FormGroup = new FormGroup({
    cat: new FormControl(""),
    desc: new FormControl(""), 
    assetno: new FormControl(""),
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

  isQcToggled: boolean = false;

  constructor(
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private _tagreuseService: TagReuseService,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _layoutService: LayoutService,
    private _commonstore: CommonStoreService,
    private _commondataService: CommonDataService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('New Item', 'tr-scan');
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

  onLocationChange(location: ILocations) {
    this.selectedLocation = location;
    this.tagReuseForm.controls['loc'].setValue(this.selectedLocation.Asset_Location_ID);
  }

  onCategoryChange(category: ICategories) {
    this.selectedCategory = category;
    this.tagReuseForm.controls['cat'].setValue(this.selectedCategory.Name);
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.destroyed$),
      switchMap((params) => {
        const epcArr: string[] = params.get('epcs').split(',');
        const epcParamArr: IEpcId[] = epcArr.map(epc => { return {"EPC_ID": epc} });
        return this._itsService.postItemsByEpcId(epcParamArr);
      })
    )
    .subscribe({
      next: (itemInfoArr) => {
        this.item = itemInfoArr[0];
        this.itemAssetId = this.item.Asset_ID.toString();

        console.log('Selected item', this.item);

        /* load default values in form fields */
        this.tagReuseForm.controls['cat'].setValue(this.item.Category);
        this.tagReuseForm.get('cat').setValidators(Validators.required);
        this.tagReuseForm.get('cat').updateValueAndValidity();

        this.tagReuseForm.controls['desc'].setValue(this.item.Description);
        this.tagReuseForm.get('desc').setValidators(Validators.required);
        this.tagReuseForm.get('desc').updateValueAndValidity();

        this.tagReuseForm.controls['assetno'].setValue(this.item.Asset_No);
        this.tagReuseForm.get('assetno').setValidators(Validators.required);
        this.tagReuseForm.get('assetno').updateValueAndValidity();

        this.tagReuseForm.controls['sku'].setValue(this.item.SKU);

        // this.tagReuseForm.controls['loc'].setValue(this.item.Asset_LocationLocation);
        this.tagReuseForm.controls['loc'].setValue(this.item.Asset_Location_ID);
        this.tagReuseForm.get('loc').setValidators(Validators.required);
        this.tagReuseForm.get('loc').updateValueAndValidity();
        
        this.tagReuseForm.controls['refno'].setValue(this.item.Ref_No);
        
        const dopDate = this.item.Date_of_Purchase?.length>0 ? new Date(this.item.Date_of_Purchase) : null;
        this.tagReuseForm.controls['dop'].setValue(dopDate);
        this.tagReuseForm.get('dop').setValidators(Validators.required);
        this.tagReuseForm.get('dop').updateValueAndValidity();

        const doeDate = this.item.Date_of_Expire?.length>0 ? new Date(this.item.Date_of_Expire) : null;
        this.tagReuseForm.controls['doe'].setValue(doeDate);

        const doweDate = this.item.Warranty_Expiry_Date?.length>0? new Date(this.item.Warranty_Expiry_Date) : null;
        this.tagReuseForm.controls['dowe'].setValue(doweDate);

        const docDate = this.item.Calibration_Date?.length>0 ? new Date(this.item.Calibration_Date) : null;
        this.tagReuseForm.controls['doc'].setValue(docDate);

        this.tagReuseForm.controls['cost'].setValue(this.item.Cost);
        this.tagReuseForm.controls['uom'].setValue(this.item.UOM);
        this.tagReuseForm.controls['batchno'].setValue(this.item.BatchNo);
        
        this.tagReuseForm.controls['rmk'].setValue(this.item.Remarks);
        this.isQcToggled = this._commonstore.verifyValueToToggle(this.item.Remarks);  /* set single item's verify value */
        
        this.tagReuseForm.controls['rmk2'].setValue(this.item.Remarks2);
        this.tagReuseForm.controls['rmk3'].setValue(this.item.Remarks3);
        this.tagReuseForm.controls['rmk4'].setValue(this.item.Remarks4);
        this.tagReuseForm.controls['rmk5'].setValue(this.item.Remarks5);
        this.tagReuseForm.controls['rmk6'].setValue(this.item.Remarks6);

        this.itemNotFound = itemInfoArr.length === 0;
        this.ref.detectChanges();
      },
      error: (error) => {
        this.itemNotFound = true;
        console.error(error);
      }
    });

    this.getDataBindingsAPI();
  }

  onVerifyToggleChange(isToggled: boolean): void {
    this.tagReuseForm.controls['rmk'].setValue(this._commonstore.toggleToVerifyValue(isToggled));
  }

  pressSubmit() {
    this.tagReuseForm.markAllAsTouched();
    
    if (this.tagReuseForm.invalid) {
      this._itsdialog.missingFormInformation().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('Missing form info dialog closed')
      });
    } else {
      this.showSubmissionPanel = true;
    }
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {

      /* only these fields are editable for multiple update items */
      const formDescription: string = Utils.removeNullValue(this.tagReuseForm.controls['desc'].value);
      const formAssetNo: string = Utils.removeNullValue(this.tagReuseForm.controls['assetno'].value);
      const formRefNo: string = Utils.removeNullValue(this.tagReuseForm.controls['refno'].value);
      const formSku: string = Utils.removeNullValue(this.tagReuseForm.controls['sku'].value);
      const formUom: string = Utils.removeNullValue(this.tagReuseForm.controls['uom'].value);
      const formBatchNo: string = Utils.removeNullValue(this.tagReuseForm.controls['batchno'].value);
      const formDoe: string = !!this.tagReuseForm.controls['doe'].value ? Utils.formatDateString(this.tagReuseForm.controls['doe'].value.toDateString()) : "";
      const formDop: string = !!this.tagReuseForm.controls['dop'].value ? Utils.formatDateString(this.tagReuseForm.controls['dop'].value.toDateString()) : "";
      const formDowe: string = !!this.tagReuseForm.controls['dowe'].value ? Utils.formatDateString(this.tagReuseForm.controls['dowe'].value.toDateString()) : "";
      const formDoc: string = !!this.tagReuseForm.controls['doc'].value ? Utils.formatDateString(this.tagReuseForm.controls['doc'].value.toDateString()) : "";
      const formCost: string = Utils.removeNullValue(this.tagReuseForm.controls['cost'].value).toString();
      const formRemarks: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk'].value);
      const formRemarks2: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk2'].value);
      const formRemarks3: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk3'].value);
      const formRemarks4: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk4'].value);
      const formRemarks5: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk5'].value);
      const formRemarks6: string = Utils.removeNullValue(this.tagReuseForm.controls['rmk6'].value);
            
      const tagReuseItem: TagReuseItem = {
        "IsIndividual": this.item.IsIndividual,
        "Category": this.selectedCategory.Name,
        "Description": formDescription,
        "EPC_ID": this.item.EPC_ID,
        "Asset_No": formAssetNo,
        "Ref_No": formRefNo,
        "SKU": formSku,
        "UOM": formUom,
        "BatchNo": formBatchNo,
        "Date_of_Expire": formDoe,
        "Date_of_Purchase": formDop,
        "Warranty_Expiry_Date": formDowe,
        "Calibration_Date": formDoc,
        "Cost": formCost,
        "PIC": this._itsService.getKeyCloakUsername(),
        "Remarks": formRemarks,
        "Remarks2": formRemarks2,
        "Remarks3": formRemarks3,
        "Remarks4": formRemarks4,
        "Remarks5": formRemarks5,
        "Remarks6": formRemarks6, 
        "Asset_Location_ID": this.selectedLocation.Asset_Location_ID.toString(),
        "AssetLocation": this.selectedLocation.Name, 
        "Asset_Status_ID": Utils.removeNullValue(this.item.Asset_Status_ID?.toString()),
        "AssetStatus": Utils.removeNullValue(this.item.Asset_StatusName), 
        "LastBal": "1",
      };

      let urlDocNo: string;
      const isRefNoEmpty: boolean = formRefNo.length === 0;
      if (isRefNoEmpty) {
        var currDateTime = new Date();
        var formattedCurrDateTime = currDateTime.toISOString().replace(/(\.\d{3})|[^\d]/g,'');
        urlDocNo = formattedCurrDateTime;
      } else {
        urlDocNo = this.tagReuseForm.value["refno"];
      }
      
      console.log("[tag-reuse] urlDocNo ", urlDocNo);
      console.log("[tag-reuse] tagReuseItem", tagReuseItem);

      this._tagreuseService.postTagReuse(urlDocNo, tagReuseItem).pipe(takeUntil(this.destroyed$)).subscribe({
        next: (response) => {
          if (response.primary) {
            this._tagreuseService.resetTags();
            this.item = undefined;
            this.router.navigate(['/tr-scan']);
          }
        }
      });
    }
    else {
      console.log('Submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

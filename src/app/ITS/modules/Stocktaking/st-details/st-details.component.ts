import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CustomFormField } from '@its/shared/interfaces/frontend/CustomFormField';
import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { StDetailsStorageKeys } from '../stocktaking.constants';

import { StorageService } from '@dis/services/storage/storage.service';

import { STNoListItem } from '@its/shared/interfaces/frontend/STNoListItem';
import { StUtilsService } from '../services/st-utils.service';
import { StSettingsService } from '../services/st-settings.service';
import { PopupSelectionService } from '@its/shared/services/popup-selection.service';
import { Observable, Subject, map, switchMap, takeUntil, tap } from 'rxjs';
import { StDetailsService } from './st-details.service';
import { ISTItemCategory } from '@its/shared/interfaces/backend/SPT_Doc/STItemCategory';
import { ISTItemLocation } from '@its/shared/interfaces/backend/SPT_Doc/STItemLocation';
import { ISTItemPIC } from '@its/shared/interfaces/backend/SPT_Doc/STItemPIC';
import { ISTItemRefNo } from '@its/shared/interfaces/backend/SPT_Doc/STItemRefNo';
import { StListService } from '../services/st-list.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { LayoutService } from '@dis/services/layout/layout.service';
import { ReloadComponentService } from '@its/shared/services/reload-component.service';
import { StFiltersStoreService } from '../services/st-filters-store.service';

@Component({
  selector: 'app-st-details',
  templateUrl: './st-details.component.html',
  styleUrls: ['./st-details.component.scss'],
  providers: [StDetailsService]
})
export class StDetailsComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  reloadElemRef: ElementRef;
  reloadComponent: any;

  stNoList: Observable<STNoListItem[]> = this._stsettingsService.stNoList$;
  selectedStNoListItem: STNoListItem;
  stDetailsFormFields: CustomFormField[];

  showFields: boolean = false;

  constructor (
    private _storage: StorageService,
    private _router: Router,
    private _stutilsService: StUtilsService,
    private _stsettingsService: StSettingsService,
    private _selectionsService: PopupSelectionService,
    private _stdetailsService: StDetailsService,
    private _stlistService: StListService,
    private _tagsService: ScannedTagsService,
    private _layoutService: LayoutService,
    private elemRef: ElementRef,
    private _reload: ReloadComponentService,
    private _stfilters: StFiltersStoreService,
  ) { 
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Stocktaking', 'mainmenunew');
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;
    this.initStDetailsFormFields();     
  }

  private initStDetailsFormFields(): void {
    this.stDetailsFormFields = [
      { 
        field: 'Category', 
        label: 'Category',
        storageKey: StDetailsStorageKeys.selectedCats, 
        required: false,
        dataItemList: undefined,
      },
      { 
        field: 'Location',  
        label: 'Location', 
        storageKey: StDetailsStorageKeys.selectedLocs,
        required: true,
        dataItemList: undefined,
      },
      { 
        field: 'PIC', 
        label: 'PIC', 
        storageKey: StDetailsStorageKeys.selectedPICs,
        required: false,
        dataItemList: undefined,
      },
      { 
        field: 'Ref_No', 
        label: 'Ref. No.', 
        storageKey: StDetailsStorageKeys.selectedRefNo,
        required: false,
        dataItemList: undefined,
      },
    ];
  }

  ngOnInit(): void {
    this.initStNoList();
  }

  private initStNoList(): void {
    this._stsettingsService.stNoList$
    .pipe(
      takeUntil(this.destroyed$),
      tap(stNoList => this.selectedStNoListItem = this._stdetailsService.getInitialSelectedStNoListItem(stNoList)),
      switchMap(() => this._stdetailsService.getSTDetailsFormFieldData(this.selectedStNoListItem.stNo)),
      tap(value => console.log('stDetailsFormFieldData', value)),
    ).subscribe({
      next: (data) => this.setStDetailDataLists(data.category, data.location, data.pic, data.refNo)
    });
  }

  private setStDetailDataLists(
    category: ISTItemCategory[],
    location: ISTItemLocation[],
    pic: ISTItemPIC[],
    refNo: ISTItemRefNo[],
  ): void {
    if (!this.selectedStNoListItem) {
      console.error('Undefined stNo'); return;
    }

    this.stDetailsFormFields.forEach((fieldObj, fieldIdx) => {
      let dataItemArr: DataItem[];
      switch(fieldObj.field) {
        case "Category":
          const cats = category.map(x => x.Name);
          if (cats.length > 0) { 
            dataItemArr = cats.map(x => { return { value: x, label: x }; }); 
          } else { dataItemArr = []; }
          this.stDetailsFormFields[fieldIdx].dataItemList = dataItemArr;
          this._selectionsService.setSelections(fieldObj.storageKey, fieldObj.dataItemList);
          break;

        case "Location":
          const locs = [...location];
          if (locs.length > 0) { 
            dataItemArr = locs.map(x => { return { value: x.ID, label: x.Name }; }); 
          } else { dataItemArr = [];}
          this.stDetailsFormFields[fieldIdx].dataItemList = dataItemArr;
          this._selectionsService.setSelections(fieldObj.storageKey, fieldObj.dataItemList);
          break;

        case "PIC":
          const pics: string[] = pic.map(x => x.Name);
          if (pics.length > 0) { 
            dataItemArr = pics.map(x => { return { value: x, label: x }; }); 
            dataItemArr = dataItemArr.filter(x => x.value.toString().length > 0); 
          } else { dataItemArr = []; }
          this.stDetailsFormFields[fieldIdx].dataItemList = dataItemArr;
          this._selectionsService.setSelections(fieldObj.storageKey, fieldObj.dataItemList);
          break;

        case "Ref_No":
          const refnos: string[] = refNo.map(x => x.Name);
          if (refnos.length > 0) { 
            dataItemArr = refnos.map(x => { return { value: x, label: x }; }); 
            dataItemArr = dataItemArr.filter(x => x.value.toString().length > 0); 
          } else { dataItemArr = []; }
          this.stDetailsFormFields[fieldIdx].dataItemList = dataItemArr;
          this._selectionsService.setSelections(fieldObj.storageKey, fieldObj.dataItemList);
          break;

        default:
          console.error("Invalid field name detected", fieldObj);            
      }
    });

    this.showFields = true;
  }

  submissionEnabled(): boolean { 
    const locsStr = this._stfilters.storedLocationStr;
    return (!!this.selectedStNoListItem) && (!this._storage.itemIsUndefinedOrEmpty(locsStr)); 
  }

  handleStNoChange(value: STNoListItem) {
    /* Clear previous selection details from storage service */
    this._stfilters.clearAllStoredFilters();

    this.selectedStNoListItem = value;

    this._stdetailsService.getSTDetailsFormFieldData(this.selectedStNoListItem.stNo).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (data) => this.setStDetailDataLists(data.category, data.location, data.pic, data.refNo)
    });
  }

  onClickGetStDetails(): void { 
    this._stfilters.updateStoredSelectedStId(this.selectedStNoListItem);
    this._stutilsService.resetStScanPageStorage();
    this._stlistService.initDefaultList().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (initialized) => {
        if (initialized) {
          this._tagsService.resetTagsService();
          this._router.navigate(['st-scan']);     
        }
      }
    });
  }

  onReload(reloaded: boolean) {
    console.log('[st-details svc] onReload');
    if (reloaded) {
      this.initStDetailsFormFields();   
      
      /* Clear previous selection details from storage service */
      this._stfilters.clearAllStoredFilters();
  
      this._reload.recreateComponent(this.reloadComponent, this.reloadElemRef); 
    }
  }

  ngOnDestroy(): void {
    this._stfilters.updateStoredFiltersIfUndefined(StDetailsStorageKeys.selectedStId, JSON.stringify(this.selectedStNoListItem));
    this._stfilters.updateStoredFiltersIfUndefined(StDetailsStorageKeys.selectedCats, JSON.stringify(this.stDetailsFormFields.find(item => item.field === 'Category').dataItemList));
    this._stfilters.updateStoredFiltersIfUndefined(StDetailsStorageKeys.selectedLocs, JSON.stringify(this.stDetailsFormFields.find(item => item.field === 'Location').dataItemList));
    this._stfilters.updateStoredFiltersIfUndefined(StDetailsStorageKeys.selectedPICs, JSON.stringify(this.stDetailsFormFields.find(item => item.field === 'PIC').dataItemList));
    this._stfilters.updateStoredFiltersIfUndefined(StDetailsStorageKeys.selectedCats, JSON.stringify(this.stDetailsFormFields.find(item => item.field === 'Ref_No').dataItemList));

    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

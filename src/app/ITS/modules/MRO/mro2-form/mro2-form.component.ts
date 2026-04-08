import { IMRORecord, ISubMRO } from '@its/shared/interfaces/frontend/MROItem';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, takeUntil } from 'rxjs';
import { MroService } from '../mro.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { LayoutService } from '@dis/services/layout/layout.service';
import { IMroPart, IMroPartDataItem } from '../components/mro-parts-list/mro-parts-list.component';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { SubMRO } from '@its/shared/interfaces/backend/SubMRO';

@Component({
  selector: 'app-mro2-form',
  templateUrl: './mro2-form.component.html',
  styleUrls: ['./mro2-form.component.scss'],
  providers: [MroService]
})
export class MRO2FormComponent implements OnInit, OnDestroy {
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();
  showSubmissionPanel: boolean = false;
  showExpandedDialog: boolean = false;
  isDraft: boolean = false;

  retrievedTags: ISelectedTag[];
  checkIn: boolean = true;

  sparePartsDialogOpenType: 'edit' | 'new';
  sparePartsList: IMroPartDataItem[] = [];
  selectedSparePart: IMroPart;
  existingData: any = null;
  existingSubMroData: any = null;
  currentExistingAssetMROHistoryID;

  public mroForm: FormGroup = new FormGroup({
    docNo: new FormControl("", Validators.required),
    pic: new FormControl("", Validators.required),
    faults: new FormControl(""),
    // spareParts: new FormControl(""),
    isRental: new FormControl(),
    isChargeable: new FormControl(),
    isWarranty: new FormControl(),
    rmk: new FormControl(""),
    uploadedImage: new FormControl()
  });

  constructor(
    private ref: ChangeDetectorRef,
    private _internalService: InternalItsServiceService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private router: Router,
    private _mroService: MroService,
    private _layoutService: LayoutService,
    private _customdialog: CustomDialogService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('MRO Details', 'mro');
    this.setFormEmpty();
  }

  fillFormFromExistingData() {
    console.log("fillFormFromExistingData", this.existingData);

    const val = this.existingData[0];
    this.mroForm.get('isRental').setValue(val.Rental);
    this.mroForm.get('isRental').updateValueAndValidity();
    this.mroForm.get('isChargeable').setValue(val.Chargeable);
    this.mroForm.get('isChargeable').updateValueAndValidity();
    this.mroForm.get('isWarranty').setValue(val.Under_Warranty);
    this.mroForm.get('isWarranty').updateValueAndValidity();
    this.mroForm.get('pic').setValue(val.Creator);
    this.mroForm.get('pic').updateValueAndValidity();
    this.mroForm.get('faults').setValue(val.Faults);
    this.mroForm.get('docNo').setValue(val.Display_ID);
    this.mroForm.get('rmk').setValue(val.MRO_Description);

    this.saveInitialMroState();
  }

  fillSubMROData() {

    let newList = [];
    this.existingSubMroData.forEach(data => {
      let newItem = {} as IMroPartDataItem;
      newItem.part = {} as IMroPart;
      newItem.part.description = data.Description;
      newItem.part.partNumber = data.PartNo;
      newItem.part.unitPrice = data.Unit_Price;
      newItem.part.quantity = data.Qty;
      newItem.part.unitPrice = data.Unit_Price;
      newItem.amount = data.Qty * data.Unit_Price;
      newList.push(newItem);
    });
    console.log("this.sparePartsList", this.sparePartsList);

    this.sparePartsList = [...newList];
    this.ref.detectChanges();
  }

  setFormEmpty() {
    this.mroForm.get('isRental').setValue(false);
    this.mroForm.get('isRental').updateValueAndValidity();
    this.mroForm.get('isChargeable').setValue(false);
    this.mroForm.get('isChargeable').updateValueAndValidity();
    this.mroForm.get('isWarranty').setValue(false);
    this.mroForm.get('isWarranty').updateValueAndValidity();
    this.mroForm.get('pic').setValue(this._itsService.getKeyCloakUsername());
    this.mroForm.get('pic').updateValueAndValidity();
  }

  onPartDelete(partToDelete: IMroPart): void {
    this.sparePartsList = this.sparePartsList.filter(dataItem => dataItem.part.partNumber !== partToDelete.partNumber);
  }

  onPartEdit(partToEdit: IMroPart): void {
    this.sparePartsDialogOpenType = 'edit';
    this.selectedSparePart = partToEdit;
  }

  onAddNewPart(): void {
    this.sparePartsDialogOpenType = 'new';
    this.selectedSparePart = null;
  }

  onCloseSparePartDialog(closeType: DialogCloseEventType, updatedDataItem: IMroPartDataItem = null): void {
    if (closeType === DialogCloseEventType.Confirm && this.sparePartsDialogOpenType === 'edit') {
      const findIdx = this.sparePartsList.findIndex(dataItem => dataItem.part.partNumber === this.selectedSparePart.partNumber);
      this.sparePartsList[findIdx] = updatedDataItem;
      this.selectedSparePart = updatedDataItem.part;
    }
    else if (closeType === DialogCloseEventType.Confirm && this.sparePartsDialogOpenType == 'new') {
      this.sparePartsList.push(updatedDataItem);
      this.selectedSparePart = updatedDataItem.part;
    }
    this.sparePartsDialogOpenType = null;
    this.sparePartsList = this.sparePartsList.slice();
  }

  get sparePartDialogTitle(): string { return !!this.selectedSparePart ? 'Edit Part' : 'Add New Part'; }

  get sparePartsTotalCost(): number { return this.sparePartsList.length === 0 ? 0 : this.sparePartsList.reduce((accumulatorObject, currentObject) => accumulatorObject + currentObject['amount'], 0); }

  get mroTags(): string[] { return this.retrievedTags.map(item => item.EPC_ID); }

  ngOnInit(): void {
    this.retrievedTags = this._internalService.retrieveSelectedTags();
    this.retrievedTags.forEach(tagItem => {
      this._itsService.getMROHistoryIfExistByAssetId(tagItem.Asset_ID).subscribe(result => {
        try {

          console.log("getMROHistoryIfExistByAssetId", tagItem.Asset_ID, result);
          this.currentExistingAssetMROHistoryID = (result[0].Asset_MRO_History_ID);
          this._itsService.getSubMROHistoryByAssetHistoryId(this.currentExistingAssetMROHistoryID).subscribe(resultSubMRO => {
            console.log("getMROHistoryIfExistByAssetId", resultSubMRO);
            this.existingSubMroData = resultSubMRO;
            this.fillSubMROData();
          });
          this.existingData = result;
          this.fillFormFromExistingData();
        } catch (e) {

        }
        if (this.mroForm.get('docNo').value === "") {
          this.updateDocNoMRO();
        }
      });
    });

    this.ref.detectChanges();
  }

  private updateDocNoMRO() {
    this._itsService.getDocNo('MRO').pipe(takeUntil(this.destroyed$)).subscribe({
      next: (docNo) => {
        this.mroForm.get('docNo').setValue(docNo);
        this.mroForm.get('docNo').updateValueAndValidity();
        this.saveInitialMroState();
      }
    });
  }

  private saveInitialMroState() {
    const defaultMroFormValues = {};
    Object.keys(this.mroForm.controls).forEach(control => defaultMroFormValues[control] = this.mroForm.get(control).value);

    this._mroService.setInitialMroState({
      retrievedTags: this.retrievedTags,
      mroFormValues: defaultMroFormValues
    });
  }

  public nullCheck(value: any) { return value === null ? "" : value; }

  public onToggleRentalChargeableWarranty(option: 'r' | 'c' | 'w'): void {
    // switch (option) {
    //   case 'r':
    //     this.mroForm.get('isRental').setValue(!this.mroForm.get('isRental').value);
    //     const isRental: boolean = this.mroForm.get('isRental').value;
    //     if (isRental) {
    //       this.mroForm.get('isChargeable').setValue(false);
    //       this.mroForm.get('isWarranty').setValue(false);
    //     }
    //     break;
    //   case 'c':
    //     this.mroForm.get('isChargeable').setValue(!this.mroForm.get('isChargeable').value);
    //     const isChargeable: boolean = this.mroForm.get('isChargeable').value;
    //     if (isChargeable) {
    //       this.mroForm.get('isRental').setValue(false);
    //       this.mroForm.get('isWarranty').setValue(false);
    //     }
    //     break;
    //   case 'w':
    //     this.mroForm.get('isWarranty').setValue(!this.mroForm.get('isWarranty').value);
    //     const isWarranty: boolean = this.mroForm.get('isWarranty').value;
    //     if (isWarranty) {
    //       this.mroForm.get('isRental').setValue(false);
    //       this.mroForm.get('isChargeable').setValue(false);
    //     }
    //     break;
    // }
    // this.mroForm.get('isRental').updateValueAndValidity();
    // this.mroForm.get('isChargeable').updateValueAndValidity();
    // this.mroForm.get('isWarranty').updateValueAndValidity();
    // this.ref.detectChanges();
  }

  pressReset() {
    this._customdialog.message(
      'Reset Form',
      'Reset form to default values?',
      [{ text: 'Yes', primary: true }, { text: 'No', primary: false }],
      'warning'
    ).subscribe({
      next: (res) => {
        if (res.primary) {
          this.mroForm.reset();
          this.sparePartsList = [];
          this.selectedSparePart = undefined;

          const initialMroState = this._mroService.getInitialMroState();
          this.retrievedTags = initialMroState.retrievedTags;
          Object.keys(initialMroState.mroFormValues).forEach(control => {
            this.mroForm.get(control).setValue(initialMroState.mroFormValues[control]);
            this.mroForm.get(control).updateValueAndValidity();
          });
        }
      }
    });
  }


  pressDraft() {
    this.mroForm.markAllAsTouched();
    this.isDraft = true;
    this.submission();
  }

  pressSubmit() {
    this.mroForm.markAllAsTouched();
    this.isDraft = false;

    if (this.mroForm.invalid) {
      this._itsdialog.missingFormInformation().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('Missing form info dialog closed')
      });
    } else { this.showSubmissionPanel = true; }
  }

  onClose(eventType: DialogCloseEventType) {

    console.log("eventType", eventType);
    if (eventType === DialogCloseEventType.Submit) {
      this.submission();
    } else { console.log('Submission cancelled'); }

    this.showSubmissionPanel = false;
  }

  submission() {

    const sparePartsResult: ISubMRO[] = [];
    const mroResult: IMRORecord[] = [];

    this.sparePartsList.forEach(sparePart => {
      
      const sparePartMro: ISubMRO = {
        "Description": sparePart.part.description,
        "PartNo": sparePart.part.partNumber,
        "Unit_Price": sparePart.part.unitPrice,
        "Qty": sparePart.part.quantity,
        "Asset_MRO_History_ID": this.currentExistingAssetMROHistoryID != null ? this.currentExistingAssetMROHistoryID : 0,
      };
      sparePartsResult.push(sparePartMro);
    });

    var availability = 1; // full submit,  0 for submit  1 for draft

    if (this.isDraft) {
      availability = 0;
    }

    this.retrievedTags.forEach(tagItem => {
      let resultItem: IMRORecord;
      if (this.currentExistingAssetMROHistoryID != null) {

        resultItem = {
          "Display_ID": this.mroForm.get('docNo').value,
          "Status": tagItem.Asset_StatusName,
          "MRO_Description": this.mroForm.get('rmk').value,
          "Date": new Date().toISOString(),
          "Creator": this.mroForm.get('pic').value,
          "Asset_ID": parseInt(tagItem.Asset_ID),
          "MHID_Offline": "",
          "Refurbish_Operation": "",
          "Faults": this.mroForm.get('faults').value,
          "Spare_parts": "",
          "Rental": this.mroForm.get('isRental').value,
          "Chargeable": this.mroForm.get('isChargeable').value,
          "Under_Warranty": this.mroForm.get('isWarranty').value,
          "Availability": availability,
          "SubMRO": sparePartsResult,
          "Asset_MRO_History_ID": this.currentExistingAssetMROHistoryID != null ? this.currentExistingAssetMROHistoryID : null,
        };
      } else {
        resultItem = {
          "Display_ID": this.mroForm.get('docNo').value,
          "Status": tagItem.Asset_StatusName,
          "MRO_Description": this.mroForm.get('rmk').value,
          "Date": new Date().toISOString(),
          "Creator": this.mroForm.get('pic').value,
          "Asset_ID": parseInt(tagItem.Asset_ID),
          "MHID_Offline": "",
          "Refurbish_Operation": "",
          "Faults": this.mroForm.get('faults').value,
          "Spare_parts": "",
          "Rental": this.mroForm.get('isRental').value,
          "Chargeable": this.mroForm.get('isChargeable').value,
          "Under_Warranty": this.mroForm.get('isWarranty').value,
          "Availability": availability,
          "SubMRO": sparePartsResult,
        };

      }
      mroResult.push(resultItem);
    });

    console.log('[mro2-form] result', mroResult);

    const postScanItems = this._internalService.retrieveSelectedScanItems().filter(item => this.retrievedTags.some(tagItem => tagItem.EPC_ID === item.EPC_ID));

    console.log("this exisiting data");
    if (this.existingData == null || this.existingData.length < 1) // should be insert
    {

      this._mroService.postMROToServerAndBlockchainWithDraft(this.mroForm.get('docNo').value, mroResult, postScanItems, this.mroForm.get('rmk').value, this.isDraft)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (response) => {
            console.log('MRO posted', response);
            if (response.primary) {
              this._mroService.clearTags();
              this.router.navigate(['/mro']);
            }
          }
        });
    } else {

      if (!this.isDraft) {
        console.log("here");
        this._mroService.updateMROToServerAndBlockchainWithDraft(this.mroForm.get('docNo').value, mroResult, postScanItems, this.mroForm.get('rmk').value, this.currentExistingAssetMROHistoryID)
          .pipe(takeUntil(this.destroyed$))
          .subscribe({
            next: (response) => {
              console.log('MRO posted', response);
              if (response.primary) {
                this._mroService.clearTags();
                this.router.navigate(['/mro']);
              }
            }
          });
      } else {
        this._mroService.updateMROs(mroResult, this.currentExistingAssetMROHistoryID)
          .pipe(takeUntil(this.destroyed$))
          .subscribe({
            next: (response) => {
              console.log('MRO posted', response);
              if (response.primary) {
                this._mroService.clearTags();
                this.router.navigate(['/mro']);
              }
            }
          });
      }
    }
  }

  toggleExpandedDialog(isExpanded: boolean) { this.showExpandedDialog = isExpanded; }

  onDeleteTags(selectedTags: string[]) {
    const updatedList = this.retrievedTags.filter(item => !selectedTags.includes(item.EPC_ID));
    if (updatedList.length > 0) {
      this.retrievedTags = updatedList;
    } else {
      this._itsdialog.denyEmptyTagList().subscribe({
        next: (res) => console.log(res)
      });
    }
    console.log('onDelete', this.retrievedTags);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}


import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import * as _ from 'lodash';
import { Subject, filter, from, switchMap, takeUntil, map } from 'rxjs';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { RegistrationService } from '../registration.service';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { Utils } from '@its/shared/classes/utils';
import { REGISTER_FORM } from '../models/register-form.model';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { LayoutService } from '@dis/services/layout/layout.service';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { OcrService } from '@its/modules/OCR/ocr.service';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { RegisterItem } from '@its/shared/interfaces/frontend/RegisterItem';
import { RFIDPrintResult } from '@its/shared/interfaces/blockchain/WheelInterfaces';
import { IInboundItem } from '@its/shared/interfaces/backend/InboundItem';
import { CreateWheelBody, Wheel } from '@its/shared/interfaces/backend/Wheel';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { ScanRfidService } from '@its/shared/services/scan-rfid.service';
import { ScanmodeService } from '@its/shared/services/scanmode.service';

@Component({
  selector: 'app-registration-module',
  templateUrl: './registration-module.component.html',
  styleUrls: ['./registration-module.component.scss'],
  providers: [RegistrationService],
})
export class RegistrationModuleComponent implements OnInit, OnDestroy {
  eyeIcon = faEye;

  private destroyed$: Subject<boolean> = new Subject();
  DEFAULT_DATE: Date = new Date(
    new Date().setFullYear(new Date().getFullYear() + 2)
  );
  dop: Date = new Date();
  reloadElemRef: ElementRef;
  reloadComponent: any;

  scannedTagsNoDup: string[] = [];

  showAllTags: boolean = false;

  formfieldTitlesDictionary: { [db: string]: string } = {};

  public registerForm: FormGroup;
  urlDocNo: string;

  inboundVerifyValue: string;

  partNoList: string[] = [];

  locationId: string = '';

  public partList: string[] = [
    'Outer Part',
    'Inner Part',
    'Nuts & Bolts',
    'Bearings',
  ];

  registerItems: RegisterItem[] = [];
  registerSet: Set<number> = new Set();
  selectedSet: Set<number> = new Set();
  public displayTags: boolean = false;
  public isAllSelected: boolean = true;

  // status (is either registering or printing)
  public isBusy: boolean = false;

  userId = '';
  constructor(
    private router: Router,
    private ref: ChangeDetectorRef,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private elemRef: ElementRef,
    private _layoutService: LayoutService,
    private _commondataService: CommonDataService,
    private _ocrService: OcrService,
    private _customDialog: CustomDialogService,
    private _tagsService: ScannedTagsService,
    private _scanRFIDService: ScanRfidService,
    private _scanBarcodeService: ScanBarcodeService,
    private _registrationService: RegistrationService,
    private _scanmodeService: ScanmodeService
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath(
      'Registration',
      'mainmenunew'
    );
    this.reloadElemRef = this.elemRef;
    this.reloadComponent = this;

    this._commondataService.inboundVerifyValue$.subscribe({
      next: (value) => (this.inboundVerifyValue = value),
    });
  }

  ngOnInit(): void {
    this.resetForm();
    this._scanRFIDService.disconnect();
    this._scanBarcodeService.connectReader()
    this._scanmodeService.scanMode$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (mode) => (console.log('Scan mode changed to', mode)),
      error: (error) => {
        console.error(error);
      },
    });
    // this._registrationService
    //   .incomingScanItems()
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe({
    //     next: (tags) => {
    //       console.log('this._registrationService incomingScanItems()', tags);
    //       if (tags.length > 0) {
    //         this.showAllTags = true;
    //       }
    //       this.scannedTagsNoDup = tags;
    //       console.log('[registration] incoming scan items', tags);
    //     },
    //   });


    (this.userId = this._itsService.getServerUserId().toString()),
      // check where was the previous first
      console.log('[registration] detectedSN', this._ocrService.getToOCRPage());
    if (!this._ocrService.getToOCRPage()) {
      const detectedSN = this._ocrService.getSerialNo();
      this.partNoList = this._ocrService.getPartNoList();
      console.log(
        '[registration] this.partNoList ',
        JSON.stringify(this.partNoList, null, 2)
      );
      if (this.partNoList.length == 0) {
        // prompt
        this._customDialog
          .message(
            'Alert',
            'No PartNo found. Please verify if the S/N is correct and manually enter the PartNo.',
            [{ text: 'Close', primary: true }],
            'warning'
          )
          .subscribe({
            next: () => {
              return;
            },
          });
      }

      console.log('[registration] detectedSN', detectedSN);
      this.registerForm.controls['refNo'].setValue(detectedSN);
      this.onFieldExit('refNo');
    }
    this._ocrService.setToOCRPage(true);
    // if its OCR, get the results out and update it inside referenceNo
    this._itsService.getLocationId('Holding Area').subscribe((res) => {
      this.locationId = res || '';
    });

    // load the OrderNo -> auto generated
    this.getDataBindingsAPI();
    this.ref.detectChanges();
  }

  private resetForm() {
    this.registerForm = REGISTER_FORM;
    this.registerForm.reset();
    for (let controlName in this.registerForm.controls) {
      this.registerForm.controls[controlName].markAsPristine();
      this.registerForm.controls[controlName].markAsUntouched();
    }
  }

  private getDataBindingsAPI() {
    this._itsService
      .getDataBinding()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (dataBindings) => {
          for (var i = 0; i < dataBindings.length; i++) {
            this.formfieldTitlesDictionary[dataBindings[i].DB_Field] =
              dataBindings[i].HH_Display_Name;
          }
        },
      });
  }
  async onFieldExit(fieldName: string) {
    if (fieldName == 'refNo') {
      // trigger the stuff
      const wheelSets: Wheel[] = await this._itsService
        .getWheelBySerialNo(this.registerForm.get('refNo').value)
        .toPromise();
      this.partNoList = wheelSets.map((wheelSet) => wheelSet.PartNo);
      //add SAP SN
      const sapSN = wheelSets?.[0]?.SerialNo_SAP ?? '';
       this.registerForm.controls['sapSN'].setValue(sapSN);
      
       if (!sapSN) {
      this._customDialog
        .message(
          'Alert',
          'No SAP No found. Please verify if the S/N is correct and manually enter the SAP No.',
          [{ text: 'Close', primary: true }],
          'warning'
        )
        .subscribe({ next: () => {} });
    }

      if (this.partNoList.length == 0) {
        // prompt
        this._customDialog
          .message(
            'Alert',
            'No PartNo found. Please verify if the S/N is correct and manually enter the PartNo.',
            [{ text: 'Close', primary: true }],
            'warning'
          )
          .subscribe({ next: () => { return; 
          },});
      }


    }
    const control = this.registerForm.get(fieldName);
    if (control) {
      control.markAsTouched(); // trigger validation
      console.log(`${fieldName} exited`, control.value);
    }
  }
  // ============ selecting ==============
  public selectResult(idx) {
    if (this.selectedSet.has(idx)) {
      this.selectedSet.delete(idx);
    } else {
      this.selectedSet.add(idx);
    }
  }

  // ============ ITEM STATUSES ============
  getStatusBadge(status: number) {
    switch (status) {
      case 0:
        return 'badge-green'; // Success/Complete
      case 1:
        return 'badge-red'; // Failed
      case 2:
        return 'badge-blue'; // In progress
      case 3:
        return 'badge-yellow'; // New
      default:
        return 'badge-gray'; // Default
    }
  }

  public getPrintStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Printed';
      case 1:
        return 'Print Failed';
      case 2:
        return 'Printing…';
      case 3:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }
  async preloadTagInfo() {
    this.registerItems = [];
    const refNoControl = this.registerForm.get('refNo');
    const batchNoControl = this.registerForm.get('batchNo');

    const refNo = refNoControl?.value?.toString().trim();
    const batchNo = batchNoControl?.value?.toString().trim();
    if (!refNo || !batchNo) {
      return;
    }
    // part 1: create the hashes
    console.log('[preloadTagInfo] refNo', refNo);
    console.log('[preloadTagInfo] batchNo', batchNo);
    // refNo + batchNo

    let existingDescSet = new Set();
    let existingItems = await this._itsService
      .getExistingWheelSetAssets(refNo, batchNo)
      .toPromise();

    let descriptionDict = {};

    existingItems.forEach((existingItem) => {
      existingDescSet.add(existingItem.Description);
      descriptionDict[existingItem.Description] = existingItem;
    });

    console.log(
      '[preloadTagInfo] existingItems',
      JSON.stringify(existingItems, null, 2)
    );

    // part 2: call the item service for the assets with matching items
    for (let idx = 0; idx < this.partList.length; idx++) {
      const descriptionExists = existingDescSet.has(this.partList[idx]);

      this.registerItems.push({
        Description: this.partList[idx],
        RFID_Number: descriptionDict[this.partList[idx]]?.EPC_ID || '',
        // 3 if new, 0 if exists
        Registration_Status: descriptionExists ? 0 : 3,
        Print_Status: descriptionExists
          ? descriptionDict[this.partList[idx]].Remarks4 == 'printed'
            ? 0
            : 3
          : 3,
      });

      if (!descriptionExists) {
        this.registerSet.add(idx);
      }
    }
    console.log(
      '[preloadTagInfo] this.registerItems',
      JSON.stringify(this.registerItems, null, 2)
    );
  }
  public async registerTags() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this._itsdialog
        .missingFormInformation()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => console.log('Missing form info'),
        });
      return;
    }
    this.registerItems = [];
    let itemsToAdd = [];
    this.isBusy = true;
    try {
      // preload + filtering
      await this.preloadTagInfo();
      const formattedDate = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '-');
      // filter out which ones to register
      Array.from(this.registerSet).map((index) => {
        const item = this.registerItems[index];
        if (item.Registration_Status == 3) {
          const { Description } = item;
          const wheelPart = {
            Category: 'Wheel Hub',
            Description: Description,
            Ref_No: this.registerForm.controls['refNo'].value,
            BatchNo: this.registerForm.controls['batchNo'].value,
            Date_of_Purchase: formattedDate,
            Cost: '0',
            Location: this.locationId,
            Qty: '1',
            IsSerilize: 'true',
            IsAutoEPCID: 'true',
            Remarks: '',
            SKU: this.registerForm.controls['SKU'].value,
            UOM: this.registerForm.controls['sapSN'].value,
          };

          itemsToAdd.push(wheelPart);
        }
      });
      console.log(
        '[registerTags] itemsToAdd',
        JSON.stringify(itemsToAdd, null, 2)
      );
      // only upload if theres something
      if (itemsToAdd.length > 0) {
        this._itsService.registerWheelhub(itemsToAdd).subscribe({
          next: async (res) => {
            console.log(
              'registerWheelhub | subscribe | res',
              JSON.stringify(res, null, 2)
            );

            // 2a) if fail, just send the error message and return
            if (res.Status != 'Success') {
              this._customDialog
                .message(
                  'Error',
                  'Failed to register wheel parts.',
                  [{ text: 'Close', primary: true }],
                  'error'
                )
                .subscribe({
                  next: () => {
                    console.log('Failed to register wheel parts | to assets');
                    this.isBusy = false;
                    return;
                  },
                });
              return;
            }

            // to ask: customer and aircraft -> do we keep this hardcoded?
            const newWheelObject: CreateWheelBody = {
              Customer: 'SIA',
              Aircraft: 'A350 MW',
              SerialNo: this.registerForm.controls['refNo'].value,
              PartNo: this.registerForm.controls['batchNo'].value,
            };
            // TO DO add to the wheel
            this._itsService.createNewWheel(newWheelObject).subscribe((res) => {
              console.log('createNewWheel | res', JSON.stringify(res, null, 2));
              console.log(
                'registerTags | createNewWheel | res | Status_Code',
                res['Status Code']
              );
              console.log(
                'registerTags | createNewWheel | res | Status',
                res.Status
              );

              // not success and wheel part does NOT exist
              if (
                res.Status != 'Success' &&
                !res.Message.includes(
                  'Wheel with same PartNo and SerialNo already exists'
                )
              ) {
                this._customDialog
                  .message(
                    'Error',
                    'Failed to register wheel parts.',
                    [{ text: 'Close', primary: true }],
                    'error'
                  )
                  .subscribe({
                    next: () => {
                      this.isBusy = false;
                      return;
                    },
                  });
                return;
              }
            });

            this._customDialog
              .message(
                'Success',
                'Wheel hub successfully registered.',
                [{ text: 'Close', primary: true }],
                'success'
              )
              .subscribe({
                next: async () => {
                  // reload and reset the registerItems.length
                  await this.preloadTagInfo();

                  this.displayTags = true;
                  for (let i = 0; i < this.registerItems.length; i++) {
                    this.selectedSet.add(i);
                  }
                  this.registerSet.clear();
                  this.isBusy = false;
                },
              });
          },
          error: (err) => {
            console.error('onSubmit | registerItemJob error', err);
            this._customDialog
              .message(
                'Error',
                'Failed to register wheel parts.',
                [{ text: 'Close', primary: true }],
                'error'
              )
              .subscribe({
                next: () => {
                  this.isBusy = false;
                  return;
                },
              });
          },
        });
        return;
      }

      // trigger the RFID results
      this._customDialog
        .message(
          'Success',
          'Wheel parts successfully retrieved.',
          [{ text: 'Close', primary: true }],
          'success'
        )
        .subscribe({
          next: async () => {
            // reload and reset the registerItems.length
            await this.preloadTagInfo();

            this.displayTags = true;
            for (let i = 0; i < this.registerItems.length; i++) {
              this.selectedSet.add(i);
            }
            this.registerSet.clear();
            this.isBusy = false;
            return;
          },
        });
    } catch (e) {
      console.log('registerTags | error', e);
      this._customDialog
        .message(
          'Error',
          'Failed to register wheel parts.',
          [{ text: 'Close', primary: true }],
          'error'
        )
        .subscribe({
          next: () => {
            this.isBusy = false;
            return;
          },
        });
    }
  }

  public async printTags() {
    if (this.selectedSet.size == 0) {
      this._customDialog
        .message(
          'Error',
          'Please select at least 1 tag to print',
          [{ text: 'Close', primary: true }],
          'error'
        )
        .subscribe({
          next: () => {
            return;
          },
        });
      return;
    }
    this.isBusy = true;

    try {
      const RFIDsToPrint: string[] = Array.from(this.selectedSet).map(
        (index) => {
          this.registerItems[index].Print_Status = 2;
          return this.registerItems[index].RFID_Number;
        }
      );

      console.log(
        'onSubmit | RFIDsToPrint',
        JSON.stringify(RFIDsToPrint, null, 2)
      );
      const serialNo = this.registerForm.controls['refNo'].value;
      const partNo = this.registerForm.controls['batchNo'].value;

      await this._itsService
        .printAssetTags(serialNo, partNo, RFIDsToPrint)
        .subscribe(async (res: RFIDPrintResult[]) => {
          if (res == null) {
            this._customDialog
              .message(
                'Error',
                'Failed to execute print task(s). Please try again later.',
                [{ text: 'Close', primary: true }],
                'error'
              )
              .subscribe({
                next: () => {
                  console.log('Failed to print RFIDs');
                  this.isBusy = false;
                  return;
                },
              });
            return;
          }
          // to do: query and update the status
          let RFIDIdxDict = {};
          for (let idx = 0; idx < this.registerItems.length; idx++) {
            RFIDIdxDict[this.registerItems[idx].RFID_Number] = idx;
          }

          console.log(
            'this.registerItems before print result update',
            JSON.stringify(this.registerItems, null, 2)
          );
          console.log('RFIDIdxDict', JSON.stringify(RFIDIdxDict, null, 2));
          console.log('print result', JSON.stringify(res, null, 2));

          res.forEach((printResult) => {
            const itemIdx = RFIDIdxDict[printResult.EPC_ID];
            // 0 is successfull, 1 is fail
            this.registerItems[itemIdx].Print_Status = printResult.isSuccessful
              ? 0
              : 1;
          });

          this._customDialog
            .message(
              'Success',
              'Print task(s) sent. Please proceed to the printer to collect the tags.',
              [{ text: 'Close', primary: true }],
              'success'
            )
            .subscribe({
              next: () => {
                console.log('RFIDs printed');
                this.isBusy = false;
                return;
              },
            });
        });
    } catch (e) {
      this._customDialog
        .message(
          'Error',
          'Failed to execute print task(s). Please try again later.',
          [{ text: 'Close', primary: true }],
          'error'
        )
        .subscribe({
          next: () => {
            console.log('Failed to print RFIDs', e);
            this.isBusy = false;
            return;
          },
        });
    }
  }

  public toggle(isTicked) {
    this.selectedSet.clear();
    if (!isTicked) return;
    for (let i = 0; i < this.registerItems.length; i++) {
      this.selectedSet.add(i);
    }
    this.isAllSelected = isTicked;
  }
  cancelAll() {
    this.registerItems = [];
    this.displayTags = false;
    this.selectedSet.clear();
    this.partNoList = [];
    this.resetForm();
  }

  // for the OCR
  redirectToOCR() {
    this._ocrService.setLastRoute(this.router.url);
    this._ocrService.setToOCRPage(true);
    this._layoutService.changeTitleDisplay('OCR');
    this.router.navigate(['ocr']);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

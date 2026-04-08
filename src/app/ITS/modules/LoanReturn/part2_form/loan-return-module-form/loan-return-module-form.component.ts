import { ILoanReturnItem } from '@its/shared/interfaces/frontend/loanReturnItem';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ICustomerDetails, LoanreturnService } from '../../loanreturn.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { Subject, take, takeUntil } from 'rxjs';
import { LayoutService } from '@dis/services/layout/layout.service';
import { exportIcon, importIcon } from '@progress/kendo-svg-icons';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { CommonDataService } from '@its/shared/services/common-data.service';
import { Utils } from '@its/shared/classes/utils';
import { ICustomerAddress } from '@its/shared/interfaces/backend/Customer/CustomerAddress';

@Component({
  selector: 'app-loan-return-module-form',
  templateUrl: './loan-return-module-form.component.html',
  styleUrls: ['./loan-return-module-form.component.scss'],
  providers: [LoanreturnService]
})
export class LoanReturnModuleFormComponent implements OnInit {
  private destroyed$: Subject<boolean> = new Subject();
  returnIcon = importIcon;
  loanIcon = exportIcon;
  showSubmissionPanel: boolean = false;
  showExpandedDialog: boolean = false;
  returning: boolean;
  disabled: 'Return'|'Loan'|'';
  LoanReturnCase: number;

  loanDurationMonths: number = 0;
  leaseEndDate: Date = new Date();
  
  retrievedTags: ISelectedTag[];  
  onlyMultipleItemsSelected: boolean = false;  

  public lrForm: FormGroup = new FormGroup({
    loc: new FormControl("", Validators.required),
    docNo: new FormControl("", Validators.required),
    uploadedImage: new FormControl(),
    pic: new FormControl("", Validators.required),
    rmk: new FormControl()
  });
  
  selectedCustomerLocationAddress: ICustomerAddress;

  constructor(
    private ref: ChangeDetectorRef, 
    private _internalService: InternalItsServiceService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private router: Router,
    private _loanreturnService: LoanreturnService,
    private _layoutService: LayoutService,
    private _commondataService: CommonDataService
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Loan/Return Details', 'loanreturn');

    this._commondataService.loanDurationInMonths$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (loanDuration) => this.loanDurationMonths = loanDuration
    });
  }

  get loanReturnTags(): string[] { return this.retrievedTags.map(item => item.EPC_ID); }

  ngOnInit(): void {
    this.retrievedTags = this._internalService.retrieveSelectedTags();
    console.log('[loan-return-form] retrievedTags', this.retrievedTags);

    this.lrForm.get('pic').setValue(this._itsService.getKeyCloakUsername());
    this.lrForm.get('pic').updateValueAndValidity();

    this.LoanReturnCase = 2;  // Temporarily hardcoded
    switch(this.LoanReturnCase) {
      case 0:      
        this.disabled = 'Loan';
        this.updateDocNoReturn();
        break;
      case 1:
        this.disabled = 'Return';
        this.updateDocNoLoan();
        break;
      case 2:
        this.disabled = '';
        this.onlyMultipleItemsSelected = true;
        break;
      default:
        console.error('Invalid LoanReturnCase');
    }

    this.lrForm.get('pic').setValue(this._itsService.getKeyCloakUsername());
    this.lrForm.get('pic').updateValueAndValidity();

    this.retrievedTags = this._internalService.retrieveSelectedTags();
    console.log('[loan-return-form] retrievedTags', this.retrievedTags);

    this.ref.detectChanges();
  }

  switchMode(chosenMode: string) {
    if (chosenMode.localeCompare('Return') === 0) {
      this.returning = true;
      this.updateDocNoReturn();
    } else {
      this.returning = false;
      this.updateDocNoLoan();
    }

    this.updateLeaseEndDate();
    this.ref.detectChanges();
  }

  private updateLeaseEndDate() {
    this.leaseEndDate = new Date();

    if (!this.returning) {
      this.leaseEndDate.setMonth(new Date().getMonth() + this.loanDurationMonths);
    }
  }

  private updateDocNoLoan() {
    this._itsService.getDocNo('LO').pipe(take(1)).subscribe({
      next: (docNo) => {
        this.lrForm.get('docNo').setValue(docNo);
        this.lrForm.get('docNo').updateValueAndValidity();
      }
    });
  }

  private updateDocNoReturn() {
    this._itsService.getDocNo('RE').pipe(take(1)).subscribe({
      next: (docNo) => {
        this.lrForm.get('docNo').setValue(docNo);
        this.lrForm.get('docNo').updateValueAndValidity();
      }
    });
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

  pressSubmit() {
    this.lrForm.markAllAsTouched();

    if (this.lrForm.invalid) {
      this._itsdialog.missingFormInformation().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => { 
          console.log('Missing form information');
        }
      });
      return;
    } 

    else if (this.returning === undefined) {
      this._loanreturnService.missingSelectionDialog().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('missingSelectionDialog closed')
      });
      return;
    }

    else if (this.returning && this._loanreturnService.containsSAvailableItem(this.retrievedTags)) {
      this._loanreturnService.returnAvailableDialog().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('returnAvailableDialog closed')
      });
      return;
    }

    else if (this.returning === false && this._loanreturnService.containsLoan(this.retrievedTags)) {
      this._loanreturnService.loanOnLoanDialog().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => console.log('loanOnLoanDialog closed')
      });
      return;
    }

    else {
      /* retrieve customer address here to reduce API calls at point of submission */
      const companyAddressId: string = this.lrForm.get('loc').value['Company_Address_ID'];
      if (companyAddressId?.length > 0) {
        this._loanreturnService.getCustomerAddressByAddressId$(companyAddressId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (customerLocationAddress) => {
            this.selectedCustomerLocationAddress = customerLocationAddress;
            this.showSubmissionPanel = true;
          },
          error: () => {
            console.warn('Unable to retrieve customer location address');
            this.selectedCustomerLocationAddress = null;
            this.showSubmissionPanel = true;
          }
        });
      } else {
        this.selectedCustomerLocationAddress = null;
        this.showSubmissionPanel = true;
      }
    }
  }
  
  onClose(closeType: DialogCloseEventType) {
    const retrievedEpcs = this.retrievedTags.map(tagItem => tagItem.EPC_ID);
    const retrievedScanItems = this._internalService.retrieveSelectedScanItems().filter(item => retrievedEpcs.includes(item.EPC_ID));

    if (closeType === DialogCloseEventType.Submit) {
      var result: ILoanReturnItem[] = [];

      const selectedCustomerLocation: ILocations = this.lrForm.get('loc').value;
      const customerDetails: ICustomerDetails = {
        name: selectedCustomerLocation.Name,
        assetLocationId: selectedCustomerLocation.Asset_Location_ID,
        address: this.selectedCustomerLocationAddress
      };


      this.retrievedTags.forEach(tag => {
        var obj: ILoanReturnItem = {
          "EPC_ID": tag.EPC_ID,
          "Qty": tag.Submitting_Amount.toString(),
          "DocumentNo": this.lrForm.get('docNo').value,
          "userid": this._itsService.getKeyCloakUsername(),
          "Remarks": this.returning ? this.lrForm.get('rmk').value : `${this.lrForm.get('rmk').value} (Lease End Date: ${Utils.formatDateString(this.leaseEndDate.toDateString())})`,
          "ReturnDate": Utils.formatDateString(this.leaseEndDate.toDateString())
        };
        result.push(obj);
      });
      
      const newLocation = this.lrForm.get('loc').value as ILocations;

      if (this.returning) {
        this._loanreturnService.postReturnToServerAndBlockchain(retrievedScanItems, result, newLocation, customerDetails)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (response) => {
            console.log('Return posted', response);
            if (response.primary) {
              this._loanreturnService.clearTags();
              this.router.navigate(['/loanreturn']);
            }
          }
        });
      } else {  
        this._loanreturnService.postLoanToServerAndBlockchain(retrievedScanItems, result, customerDetails, this.leaseEndDate)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (response) => {
            console.log('Loan posted', response);
            if (response.primary) {
              this._loanreturnService.clearTags();
              this.router.navigate(['/loanreturn']);
            }
          }
        });
      }
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

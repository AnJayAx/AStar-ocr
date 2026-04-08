import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';

import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { ProductreceiveService } from '../../productreceive.service';
import { ICheckInOutItem } from '@its/shared/interfaces/frontend/CheckInOutItem';
import { Subject, takeUntil } from 'rxjs';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { LayoutService } from '@dis/services/layout/layout.service';
import { exportIcon, importIcon } from '@progress/kendo-svg-icons';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';

//import { ScanViewService } from '@its/shared/components/Scanning/scan-view-pr/scan-view-pr/scan-view.service';
import { ScanViewService } from '@its/shared/components/Scanning/scan-view/scan-view.service';

@Component({
  selector: 'app-productreceive-form',
  templateUrl: './productreceive-form.component.html',
  styleUrls: ['./productreceive-form.component.scss'],
  providers: [ProductreceiveService]
})
export class ProductreceiveFormComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  checkinIcon = importIcon;
  checkoutIcon = exportIcon;
  showSubmissionPanel: boolean = false;
  showExpandedDialog: boolean = false;
  showCheckOut: boolean = false;
  showCheckIn: boolean = false;

  productLotNo: string = '';

  retrievedTags: ISelectedTag[];  // var to contain selected tags passed from scan segment of checkinout
  checkInOutCase: number;  // number var to check whether check in out buttons are toggleable

  checkIn: boolean = true;  // check in out boolean vars
  disabled: 'checkin'|'checkout'|''; 

  onlyMultipleItemsSelected: boolean = false;  // boolean to check if all items selected are multiple

  public cicoForm: FormGroup = new FormGroup({
    docNo: new FormControl(), // value should be pulled from backend
    uploadedImage: new FormControl(),
    pic: new FormControl(),
    rmk: new FormControl()
  });
  
  get submissionDialogTitle(): string {
    let title: string = '';
    if (this.checkIn === true) {
      title = 'Submit Check In';
    } else if (this.checkIn === false)  {
      title = 'Submit Check Out';
    } 
    return title;
  }
  
  get cicoTags(): string[] { return this.retrievedTags.map(item => item.EPC_ID); }

  constructor(
    private ref: ChangeDetectorRef,
    private _internalService: InternalItsServiceService,
    private _itsService: ItsServiceService,
    private _productReceiveService: ProductreceiveService,
    private _customDialog: CustomDialogService,
    private router: Router,
    private _layoutService: LayoutService,
    private _itsdialog: ItsDialogService,
    private _scanview: ScanViewService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Receive Details', 'productreceive');
  }

  ngOnInit(): void {

    this._scanview.currentProductLotNo.subscribe(
      lotNo => {
        this.productLotNo = lotNo;
        console.log("Lot No in Form Component:", this.productLotNo);
      }
    );

    this.cicoForm.get('pic').setValue(this._itsService.getKeyCloakUsername());
    this.cicoForm.get('rmk').setValue(this.productLotNo);
    this.retrievedTags = this._internalService.retrieveSelectedTags();
    for (let i=0; i<this.retrievedTags.length; i++) {
      if (this.retrievedTags[i].SM.toLowerCase() === 's') {
        this.retrievedTags[i].Submitting_Amount = 1;
      }
    }

    this.checkInOutCase = 2;  // Temporarily hardcoded
    switch(this.checkInOutCase) {
      case 0:
        this.disabled = 'checkout';
        this.updateDocNoCI();
        break;
      case 1:
        this.disabled = 'checkin';
        this.updateDocNoCO();
        break;
      case 2:
        this.disabled = '';
        this.onlyMultipleItemsSelected = true;
        this.updateDocNoCI();
        break;
      default:
        console.error('Invalid checkInOutCase');
    }
  }

  // choosing check in or check out
  // switches between online mode and offline mode
  switchMode(chosenMode:string) {
    if (chosenMode.localeCompare('Check In') === 0) {
      this.checkIn = true;
      this.updateDocNoCI();
      console.log('AFTER CI');
    } else {
      this.checkIn = false;
      this.updateDocNoCO();
      console.log('AFTER CO');
    }
    this.ref.detectChanges();
  }

  private updateDocNoCO() {
    this._itsService.getDocNo('CO').subscribe({
      next: (docNo) => {
        this.cicoForm.get('docNo').setValue(docNo);
      }
    });
  }

  private updateDocNoCI() {
    this._itsService.getDocNo('CI').subscribe({
      next: (docNo) => {
        this.cicoForm.get('docNo').setValue(docNo);
      }
    });
  }

  public nullCheck(value: any) {
    if (value == null) {
      return "";
    } else {
      return value;
    }
  }

  pressSubmit() {
    if (this.checkIn === undefined) {
      this._customDialog.message(
        'Missing Selection', 'Please select the "Check In" or "Check Out" option',
        [{ text: 'Close', primary: true }], 'error'
      ).subscribe({
        next: () => { console.log('Check in/out not selected'); return; }
      });
      return;
    }

    else if (this._productReceiveService.containsSAvailableItem(this.retrievedTags) && this.checkIn) {
      this._customDialog.message(
        'Item Error', 'Unable to check in due to detection of "Available" items.',
        [{ text: 'Close', primary: true }], 'error'
      ).subscribe({
        next: () => { console.log('Check in failed to due to available items detected'); return; }
      });
      return;
    }

    else if (this._productReceiveService.containsCheckOut(this.retrievedTags) && this.checkIn === false) {
      this._customDialog.message(
        'Item Error', 'Unable to check out due to detection of "Unavailable" items.',
        [{ text: 'Close', primary: true }], 'error'
      ).subscribe({
        next: () => { console.log('Check out failed due to unavailable items detected'); return; }
      });
      return;
    }

    this.showSubmissionPanel = true;
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      var result: ICheckInOutItem[] = [];
      this.retrievedTags.forEach(tag => {
        var obj: ICheckInOutItem  = {
          "EPC_ID": tag.EPC_ID,
          "Qty": tag.ReceiveQty.toString(),
          "DocumentNo": this.cicoForm.get('docNo').value,
          "userid": this._itsService.getKeyCloakUsername(),
          "Remarks": this.cicoForm.get('rmk').value
        };
        result.push(obj);
      });
      console.log('cico submission result', result);

      if (this.checkIn === true) {
        this._productReceiveService.postCheckIn(result).pipe(takeUntil(this.destroyed$)).subscribe({
          next: (response) => { 
            console.log('Check in posted');
            if (response.primary) {
              this._productReceiveService.clearTags();
              this.returnToScanPage();
            } 
          }
        });
      }
      else {
        this._productReceiveService.postCheckOut(result).pipe(takeUntil(this.destroyed$)).subscribe({
          next: (response) => { 
            console.log('Check out posted'); 
            if (response.primary) {
              this._productReceiveService.clearTags();
              this.returnToScanPage();
            }
          }
        });
      }
    } else {
      console.log('Submission cancelled');
    }

    this.showSubmissionPanel = false;
  }

  public formatDateString(date: string) {
    if (!(date === "")) {
      var dateArray = date.split(" ");
      var result = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[3];
      return result;
    } else {
      return date;
    }
  }

  toggleExpandedDialog(isExpanded: boolean) { this.showExpandedDialog = isExpanded; }

  // onDeleteTag(selectedTag: string) {
  //   const updatedList = this.retrievedTags.filter(item => item.EPC_ID !== selectedTag);
  //   if (updatedList.length > 0) {
  //     this.retrievedTags = updatedList;
  //   } else {
  //     this._itsdialog.denyEmptyTagList().subscribe({
  //       next: (res) => console.log(res)
  //     });
  //   }
  //   console.log('onDelete', this.retrievedTags);
  // }

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

  public returnToScanPage() {
    this.router.navigate(['/productreceive']);
  }
  
}

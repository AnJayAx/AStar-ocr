import { IRelocationItem } from '@its/shared/interfaces/frontend/relocationItem';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ToastService } from '@dis/services/message/toast.service';
import { RelocationService } from '../../relocation.service';
import { Observable, Subject, takeUntil, tap, filter, map } from 'rxjs';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { Utils } from '@its/shared/classes/utils';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { qrCodeIcon } from '@progress/kendo-svg-icons';
import { ScanBarcodeService } from '@its/shared/services/scan-barcode.service';
import { ScanMode, ScanmodeService } from '@its/shared/services/scanmode.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-relocation-module-form',
  templateUrl: './relocation-module-form.component.html',
  styleUrls: ['./relocation-module-form.component.scss'],
  providers: [ ScannedTagsService ]
})
export class RelocationModuleFormComponent implements OnInit, OnDestroy, AfterViewInit {
  qrCodeIcon = qrCodeIcon;
  private destroyed$: Subject<boolean> = new Subject();
  showExpandedDialog: boolean = false;

  relocationTagItems: ISelectedTag[] = [];
  get relocationTags(): string[] {
    return this.relocationTagItems.map(item => item.EPC_ID);
  }

  public relocForm: FormGroup = new FormGroup({
    docNo: new FormControl("", Validators.required),
    pic: new FormControl("", Validators.required),
    loc: new FormControl("", Validators.required),
    rmk: new FormControl(),
    uploadedImage: new FormControl()
  });
  
  private inputLocation: string;
  locationsList: any[] = [];
  locationsDictionary: { [name: string]: number } = {};

  showSubmissionPanel: boolean = false;

  isCameraValid$: Observable<boolean> = this._barcodeService.cameraValid$;
  incomingBarQRCode$: Observable<string> = this._tagsService.scannedTags$.pipe(
    takeUntil(this.destroyed$),
    filter(tags => tags.length > 0),
    map(tags => tags.toString()),
    tap(() => this._tagsService.clearScannedTags())
  );

  constructor(
    private ref: ChangeDetectorRef,
    private _internalService: InternalItsServiceService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private router: Router,
    private _toast: ToastService,
    private _relocationService: RelocationService,
    private _barcodeService: ScanBarcodeService,

    private _scanmodeService: ScanmodeService,
    private _tagsService: ScannedTagsService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Relocation Details', 'relocation');
    
    this._barcodeService.connectReader()
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (response) => {
        console.log('[B] Response from native: ', response)
        this._scanmodeService.setSelectedScanMode(ScanMode.Barcode);
      }
    });
    if (this.router.getCurrentNavigation().extras.state?.data) {
      this.inputLocation = this.router.getCurrentNavigation().extras.state["data"];
    }

    this.relocationTagItems = this._internalService.retrieveSelectedTags();
  }

  toQRPage() {
    this.router.navigate(['qr-scan-page', { backUrl: 'relocationform' }]);
  }

  ngOnInit(): void {
    this.getLocationsAPI();    
    this.updateDocNoRelocation();    

    this.relocForm.get('pic').setValue(this._itsService.getKeyCloakUsername());    
    
    this.relocForm.get('docNo').updateValueAndValidity();
    this.relocForm.get('pic').updateValueAndValidity();
    this.ref.detectChanges();
  }

  ngAfterViewInit(): void {
    this.incomingBarQRCode$.subscribe({
      next: (data) => {
        this.inputLocation = data;
        if (this.locationsList.length > 0) {
          if (!this.setValidLocation(this.inputLocation)) {
            console.error('No locations or invalid location selected');
            console.log('locationsList', this.locationsList);
          }
        } else {
          console.warn('Locations list length is 0');
        }
        this.ref.detectChanges();
      },
      complete: () => this._relocationService.clearTags()
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

        if (this.inputLocation) {
          if (!this.setValidLocation(this.inputLocation)) {
            this._toast.error(`Scanned location value ${this.inputLocation} is invalid`);
          }
        }
      }
    });
  }

  private setValidLocation(inputLocationValue: string): boolean {
    const normalizedLocations = this.locationsList.map(location => Utils.normalized(location));
    const findIdx = normalizedLocations.findIndex(loc => loc === Utils.normalized(inputLocationValue));

    if (findIdx >= 0) {
      const selectedLocation = this.locationsList[findIdx];
      this.relocForm.get('loc').setValue(selectedLocation);
      return true;
    }
    return false;
  }

  private updateDocNoRelocation() {
    this._itsService.getDocNo('RL').pipe(takeUntil(this.destroyed$)).subscribe({
      next: (docNo) => {
        this.relocForm.get('docNo').setValue(docNo);
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

  toggleExpandedDialog(isExpanded: boolean) {
    this.showExpandedDialog = isExpanded;
  }

  onDeleteTags(selectedTags: string[]) {
    const updatedList = this.relocationTagItems.filter(item => !selectedTags.includes(item.EPC_ID));
    if (updatedList.length > 0) {
      this.relocationTagItems = updatedList;
    } else {
      this._itsdialog.denyEmptyTagList().subscribe({
        next: (res) => console.log(res)
      });
    }
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      var result: IRelocationItem[] = [];
      this.relocationTagItems.forEach(tag => {
        var obj:IRelocationItem = {
          "EPC_ID": tag.EPC_ID,
          "Qty": tag.Submitting_Amount.toString(),
          "DocumentNo": this.relocForm.get('docNo').value,
          "userid": this._itsService.getKeyCloakUsername(),
          "Remarks": this.relocForm.get('rmk').value
        };
        result.push(obj);
      })

      const newLocId = this.relocForm.get('loc').value['Asset_Location_ID'];

      this._relocationService.postRelocation(result, newLocId).subscribe({
        next: (response) => {
          if(response.primary) {
            this._relocationService.clearTags();
            this.router.navigate(['/relocation']);
          }
        }
      });
    } else {
      console.log('Submission cancelled');
    }
    this.showSubmissionPanel = false;
  }

  pressSubmit() {
    this.relocForm.markAllAsTouched();

    if (this.relocForm.invalid) {     
      this._itsdialog.missingFormInformation().pipe(takeUntil(this.destroyed$)).subscribe({
        next: () => { console.log('Invalid form'); }
      });
    } else {
      this.showSubmissionPanel = true;
    }
  }

  ngOnDestroy(): void{
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

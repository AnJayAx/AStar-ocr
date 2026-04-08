import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ScrapService } from '../scrap.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { LayoutService } from '@dis/services/layout/layout.service';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Component({
  selector: 'app-scrap2-form',
  templateUrl: './scrap2-form.component.html',
  styleUrls: ['./scrap2-form.component.scss'],
  providers: [ScrapService]
})
export class Scrap2FormComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  showSubmissionPanel: boolean = false;

  scrapScanItems: IItemInfo[] = [];

  public scrapForm: FormGroup = new FormGroup({
    pic: new FormControl("", Validators.required),
    rmk: new FormControl(),
    uploadedImage: new FormControl()
  });
  
  locationsList: any[] = [];
  locationsDictionary: { [name: string]: number } = {};
  signatureData: string;

  constructor(
    private ref: ChangeDetectorRef, 
    private _internalService: InternalItsServiceService, 
    private router: Router,
    private _scrapService: ScrapService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Scrap Details', 'scrap');
  }

  ngOnInit(): void {
    this.scrapScanItems = this._internalService.retrieveSelectedScanItems();
    this.ref.detectChanges();
  }

  public nullCheck(value: any) {
    if (value == null) {
      return "";
    } else {
      return value;
    }
  }

  
  pressSubmit() {
    this.scrapForm.markAllAsTouched();
      this.showSubmissionPanel = true;
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      this._scrapService.postScrapToServerAndBlockchain(this.scrapScanItems, this.scrapForm.get('rmk').value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.primary) {
            this._scrapService.clearTags();
            this.router.navigate(['/scrap']);
          }
        }
      });

    } else { console.log('Submission cancelled'); }
    this.showSubmissionPanel = false;
  }

  getUpdatedSignature(signatureData: string) {
    this.signatureData = signatureData;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

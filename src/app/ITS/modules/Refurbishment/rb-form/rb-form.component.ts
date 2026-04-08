import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LayoutService } from '@dis/services/layout/layout.service';
import { faCircleCheck, faCircleXmark, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { InternalItsServiceService } from '@its/shared/services/internal-its-service.service';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { RefurbishmentService } from '../refurbishment.service';
import { Router } from '@angular/router';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { Observable, Subject, map, take, takeUntil } from 'rxjs';
import { ItsServiceService } from '@its/shared/services/its-service.service';

@Component({
  selector: 'app-rb-form',
  templateUrl: './rb-form.component.html',
  styleUrls: ['./rb-form.component.scss']
})
export class RbFormComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  passIcon = faCircleCheck;
  failIcon = faCircleXmark;
  deleteIcon = faTrashCan;
  showExpandedDialog: boolean = false;
  showSubmissionPanel: boolean = false;

  refurbishScanItems: IItemInfo[] = [];
 
  refurbishOptions$: Observable<string[]> = this._itsService.getAllRefurbishmentOperations().pipe(map(operations => { return operations.map(operation => operation.Operation); }));
  refurbishOptions: string[];
  initialRefurbishOptions: string[];
  viewRefurbishOptions: string[];
  filterRefurbishOption: string;

  refurbishForm: FormGroup = new FormGroup({
    refurbishOption: new FormControl("", Validators.required),
    remark: new FormControl()
  });
  passFail: 'pass'|'fail';

  constructor(
    private _internalService: InternalItsServiceService,
    private _layoutService: LayoutService,
    private _itsdialog: ItsDialogService,
    private _refurbishService: RefurbishmentService,
    private router: Router,
    private _itsService: ItsServiceService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Submit Tags', 'rb-scan');

    this.refurbishScanItems = this._internalService.retrieveSelectedScanItems();
    console.log('[rb-form] refurbishScanItems', this.refurbishScanItems);

    this.refurbishOptions$.pipe(takeUntil(this.destroyed$), take(1)).subscribe({
      next: (options) => {
        this.refurbishOptions = [...options];
        this.initialRefurbishOptions = [...options];
        this.viewRefurbishOptions = [...options];
        console.log('[rb-form] refurbish options update', options);
      }
    });
  }

  get refurbishTags(): string[] {
    return this.refurbishScanItems.length > 0 ? this.refurbishScanItems.map(item => item.EPC_ID) : [];
  }

  isPassFailBtnHighlighted(btnValue: 'pass'|'fail'): boolean {
    return this.passFail === btnValue;
  } 

  public handleFilter(value) {
    console.log('[rb-form] handleFilter value', value);
    this.filterRefurbishOption = value;
    this.viewRefurbishOptions = this.refurbishOptions.filter(
      (s) => s.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  public addNew(): void {
    this.refurbishOptions.push(this.filterRefurbishOption);
    this.handleFilter(this.filterRefurbishOption);
  }

  public deleteAddedOption(deleteOption: string): void {
    this.refurbishOptions = this.refurbishOptions.filter(option => option.toLowerCase() !== deleteOption.toLowerCase());
    this.viewRefurbishOptions = this.viewRefurbishOptions.filter(option => option.toLowerCase() !== deleteOption.toLowerCase());
    if (this.refurbishForm.controls['refurbishOption'].value.toLowerCase() === deleteOption.toLowerCase()) {
      this.refurbishForm.controls['refurbishOption'].setValue('');
    }
  }

  ngOnInit(): void {}

  toggleExpandedDialog(isExpanded: boolean) {
    this.showExpandedDialog = isExpanded;
  }

  onDeleteTags(selectedTags: string[]) {
    this.refurbishScanItems = this.refurbishScanItems.filter(item => !selectedTags.includes(item.EPC_ID));
    console.log('[rb-form] onDeleteTags', this.refurbishScanItems);
  }

  onPassFailChange(value: 'pass'|'fail') {
    this.passFail = value;
    if (this.passFail === 'fail') {
      this.refurbishForm.get('remark').setValidators([Validators.required]);
    } else {
      this.refurbishForm.get('remark').clearValidators();
    }
    this.refurbishForm.get('remark').updateValueAndValidity();
  }

  pressSubmit() {
    this.refurbishForm.markAllAsTouched();

    if (this.refurbishForm.invalid) {
      this._itsdialog.missingFormInformation().subscribe({
        next: () => console.log('Invalid form')
      });
    } else {
      this.showSubmissionPanel = true;
    }
  }

  onClose(closeType: DialogCloseEventType) {
    if (closeType === DialogCloseEventType.Submit) {
      this._refurbishService.postRefurbishmentToServerAndBlockchain(this.passFail, this.refurbishForm.get('refurbishOption').value, this.refurbishScanItems, this.refurbishForm.get('remark').value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.primary) {
            this._refurbishService.clearTags();
            this.router.navigate(['rb-scan']);
          }
        }
      });
    }
    this.showSubmissionPanel = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

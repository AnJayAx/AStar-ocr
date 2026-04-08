import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IMroPart, IMroPartDataItem } from '@its/modules/MRO/components/mro-parts-list/mro-parts-list.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mro-part-form',
  templateUrl: './mro-part-form.component.html',
  styleUrls: ['./mro-part-form.component.scss']
})
export class MroPartFormComponent implements OnInit, OnDestroy {

  private destroyed$: Subject<boolean> = new Subject();

  @Input() editPart: IMroPart;
  @Output() partUpdateCancelled: EventEmitter<boolean> = new EventEmitter();
  @Output() partUpdateConfirmed: EventEmitter<IMroPartDataItem> = new EventEmitter();

  partAmountDisplay: number;

  partForm: FormGroup = new FormGroup({
    partNumber: new FormControl(),
    description: new FormControl(),
    unitPrice: new FormControl(),
    quantity: new FormControl()
  });

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!!this.editPart) {
      this.partForm.get('partNumber').setValue(this.editPart.partNumber);
      this.partForm.get('description').setValue(this.editPart.description);
      this.partForm.get('unitPrice').setValue(this.editPart.unitPrice);
      this.partForm.get('quantity').setValue(this.editPart.quantity);
    } else {
      this.partForm.get('unitPrice').setValue(0);
      this.partForm.get('quantity').setValue(1);
    }
    Object.keys(this.partForm.controls).forEach(field => this.partForm.get(field).updateValueAndValidity());
    this.updatePartAmountDisplay();

    this.partForm.valueChanges
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: () => this.updatePartAmountDisplay()
    });
  }

  private updatePartAmountDisplay(): void {
    if (!!this.partForm.get('unitPrice').value && !!this.partForm.get('quantity').value) {
      const updatedUnitPrice = this.partForm.get('unitPrice').value;
      const updatedQuantity = this.partForm.get('quantity').value;
      this.partAmountDisplay = updatedUnitPrice * updatedQuantity;
    } else {
      this.partAmountDisplay = 0;
    }
    this.ref.detectChanges();
  }

  onCancelPartUpdate(): void { this.partUpdateCancelled.emit(true); }

  onConfirmPartUpdate(): void {this.partUpdateConfirmed.emit({ part: this.partForm.getRawValue(), amount: this.partAmountDisplay });}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

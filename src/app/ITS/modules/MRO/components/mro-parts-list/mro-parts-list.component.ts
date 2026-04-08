import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { pencilIcon, trashIcon } from '@progress/kendo-svg-icons';

export interface IMroPart {
  partNumber: string;
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface IMroPartDataItem {
  part: IMroPart;
  amount: number;
}

@Component({
  selector: 'app-mro-parts-list',
  templateUrl: './mro-parts-list.component.html',
  styleUrls: ['./mro-parts-list.component.scss']
})
export class MroPartsListComponent implements OnInit {
  // trashIcon = trashIcon;
  // pencilIcon = pencilIcon;
  trashIcon = faTrashCan;
  pencilIcon = faPencil;

  @Input() partsList: IMroPartDataItem[];

  @Output() deletePart: EventEmitter<IMroPart> = new EventEmitter();
  @Output() editPart: EventEmitter<IMroPart> = new EventEmitter();
  @Output() newPart: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private _customdialog: CustomDialogService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  onPartDelete(part: IMroPart) {
    this._customdialog.message(
      `Confirm Deletion`,
      `Delete spare part with part no.: ${part.partNumber}?`,
      [{ text: 'Yes', primary: true }, { text: 'No', primary: false }],
      "warning"
    ).subscribe({
      next: (response)  => {
        if (response.primary) {
          this.deletePart.emit(part);
          console.log('TEST delete', part);
        }
      }
    });
  }

  onPartEdit(part: IMroPart) {
    this.editPart.emit(part);
    console.log('TEST edit', part);
  }

  onPartAdd() {
    this.newPart.emit(true);
    console.log('TEST add');
  }

}

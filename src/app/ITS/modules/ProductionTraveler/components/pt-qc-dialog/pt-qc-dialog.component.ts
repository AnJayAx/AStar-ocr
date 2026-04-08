import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { Qc_Action_Type } from '../../production-traveler.constants';
import { Utils } from '@its/shared/classes/utils';
import { IQcInfo } from '@its/modules/ProductionTraveler/services/pt-submission-store.service';

@Component({
  selector: 'app-pt-qc-dialog',
  templateUrl: './pt-qc-dialog.component.html',
  styleUrls: ['./pt-qc-dialog.component.scss']
})
export class PtQcDialogComponent implements OnInit {
  DialogCloseEventType = DialogCloseEventType;

  actionList: Qc_Action_Type[] = [];

  qcInfoForm: FormGroup;
  outputQcInfo: IQcInfo;
  @Input() operationId: number; /* for display use only */
  @Output() qcDialogClosed: EventEmitter<{closeEvent: DialogCloseEventType, isBack: boolean, outputQcInfo: IQcInfo}> = new EventEmitter();

  constructor() {
    this.actionList = Object.values(Qc_Action_Type);

    this.qcInfoForm = new FormGroup({
      action: new FormControl(this.actionList[0], Validators.required),
      remarks: new FormControl("")
    });

    this.outputQcInfo = { action: this.actionList[0], remarks: "" };
  }

  ngOnInit(): void {
    this.qcInfoForm.valueChanges.subscribe({
      next: (changes) => {
        console.log('[pt-qc-dialog] form changes', changes);
        this.outputQcInfo['action'] = this.qcInfoForm.get('action').value;
        this.outputQcInfo['remarks'] = Utils.removeNullValue(this.qcInfoForm.get('remarks').value);
      }
    });
  }

  onCloseDialog(closeEvent: DialogCloseEventType, isBack: boolean = false) {
    this.qcDialogClosed.emit({ closeEvent: closeEvent, isBack: isBack, outputQcInfo: this.outputQcInfo });
  }

  onBack() {
    this.onCloseDialog(DialogCloseEventType.Cancel, true);
  }

}

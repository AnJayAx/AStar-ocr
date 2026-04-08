import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PT_OPERATION_FORM } from '../production-traveler.constants';

@Injectable({
  providedIn: 'root'
})
export class PtOperationDetailsStoreService {

  operationFormState: FormGroup = PT_OPERATION_FORM;
  isDefaultOperationForm: boolean = false;
  showEpcScanDialogState: boolean = false;
  numOfTagsNeededState: number = 0;
  scannedTagsState: string[] = [];
  displayScannedTagsState: string[] = [];
  showBomPanelState: boolean = false;
  selectedOperationIdState: number = null;

  updateOperationFormState(operationForm: FormGroup) { 
    this.operationFormState = operationForm; 
    this.isDefaultOperationForm = false;
  }
  updateShowEpcScanDialogState(showEpcScanDialog: boolean) { this.showEpcScanDialogState = showEpcScanDialog; }
  updateNumOfTagsNeededState(numOfTagsNeeded: number) { this.numOfTagsNeededState = numOfTagsNeeded; }
  updateScannedTagsState(scannedTags: string[]) { this.scannedTagsState = scannedTags; }
  updateDisplayScannedTagsState(displayScannedTags: string[]) { this.displayScannedTagsState = displayScannedTags; }
  updateShowBomPanelState(showBomPanel: boolean) { this.showBomPanelState = showBomPanel; }
  updateSelectedOperationIdState(selectedOperationId: number) { this.selectedOperationIdState = selectedOperationId; }

  reset() {
    this.operationFormState = PT_OPERATION_FORM;
    this.isDefaultOperationForm = true;
    this.operationFormState.reset();
    this.showEpcScanDialogState = false;
    this.numOfTagsNeededState = 0;
    this.scannedTagsState = [];
    this.displayScannedTagsState = [];
    this.showBomPanelState = false;
    this.selectedOperationIdState = null;

    console.log('[pt traveler store] reset first operation state', this.operationFormState);
  }

  constructor() { }
}

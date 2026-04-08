import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Utils } from '@its/shared/classes/utils';
import { IRepack } from '@its/shared/interfaces/backend/Repack';
import { ItemsplitService } from '../../services/itemsplit.service';
import { ToastService } from '@dis/services/message/toast.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, takeUntil } from 'rxjs';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { DialogCloseEventType } from '@its/shared/constants/constants';

@Component({
  selector: 'app-is-repack-dialog',
  templateUrl: './is-repack-dialog.component.html',
  styleUrls: ['./is-repack-dialog.component.scss']
})
export class IsRepackDialogComponent implements OnInit {
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();
  open: boolean = true;
  loaded: boolean = false;
  invalidForm: boolean = false;
  submitError: boolean = false;

  @Input() selectedRepackEPC: string;
  @Input() repackQty: number;
  @Input() repackEPCs: string[];
  @Output() closed: EventEmitter<DialogCloseEventType> = new EventEmitter();

  id: string;
  name: string;
  noEpcIds: string;

  repackForm: FormGroup = new FormGroup({
    idescs: new FormControl(''),
    iskus: new FormControl(''),
    ibatchs: new FormControl(''),
    iuom: new FormControl(''),
  });

  constructor(
    private _itemsplitService: ItemsplitService,
    private _itsService: ItsServiceService,
  ) { }

  ngOnInit(): void {
    this._itsService.postItemsByEpcId([{"EPC_ID": this.selectedRepackEPC}]).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (itemInfoArr: IItemInfo[]) => {
        const item = itemInfoArr[0];
        console.log('repack item info', item);
        this.id = Utils.removeNullValue(item.Asset_ID).toString();
        this.name = Utils.removeNullValue(this.repackQty).toString();
        this.noEpcIds = Utils.removeNullValue(this.repackEPCs).toString();
        this.repackForm.controls['idescs'].setValue(Utils.removeNullValue(item.Description));
        this.repackForm.controls['iskus'].setValue(Utils.removeNullValue(item.SKU));
        this.repackForm.controls['ibatchs'].setValue(Utils.removeNullValue(item.BatchNo));
        this.repackForm.controls['iuom'].setValue(Utils.removeNullValue(item.UOM));
      },
      complete: () => this.loaded = true
    });
  }

  onClose(type: DialogCloseEventType) {
    if (type === DialogCloseEventType.Cancel) {
      this.closed.emit(DialogCloseEventType.Cancel);
      this.open = false;
    } else {
      this.onConfirm();
    }
  }

  private onConfirm() {
    if (!this.isSkuOrDescValidated()) {
      this.invalidForm = true;
      return;
    }

    this.invalidForm = false;

    const postRepack: IRepack = {
      ID: this.id,
      Name: this.name,
      NoEPCIDs: this.noEpcIds,
      idescs: Utils.removeNullValue(this.repackForm.get('idescs').value),
      iskus: Utils.removeNullValue(this.repackForm.get('iskus').value),
      ibatchs: Utils.removeNullValue(this.repackForm.get('ibatchs').value),
      iuom: Utils.removeNullValue(this.repackForm.get('iuom').value),
    };

    this._itemsplitService.postRepackItem(postRepack).subscribe({
      next: (response) => {
        console.log('POST repack item response', response);
        if (!response.primary) {
          this.submitError = true;
        } else {
          this.open = false;
          this.submitError = false;
          this.closed.emit(DialogCloseEventType.Submit);
        }
      },
      error: (error) => {
        this.submitError = true;
        console.error('ERROR', error);
      }
    });

  }

  /* At least one of idescs or iskus must be filled */
  private isSkuOrDescValidated() {
    const skuData = Utils.removeNullValue(this.repackForm.get('iskus').value).toString();
    const descData = Utils.removeNullValue(this.repackForm.get('idescs').value).toString();
    return skuData.length>0 && descData.length>0;
  }

}

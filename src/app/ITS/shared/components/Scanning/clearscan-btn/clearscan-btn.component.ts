import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';
import { StorageService } from '@dis/services/storage/storage.service';
import { scannedTagsKey } from '@its/shared/constants/storagekeys.constants';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';

@Component({
  selector: 'app-clearscan-btn',
  templateUrl: './clearscan-btn.component.html',
  styleUrls: ['./clearscan-btn.component.scss']
})
export class ClearscanBtnComponent implements OnInit {
  @Output() scanTagsCleared: EventEmitter<boolean> = new EventEmitter(false);
  @Output() clicked: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private _storage: StorageService,
    private _tagsService: ScannedTagsService,
    private _toast: ToastService,
  ) {}

  ngOnInit(): void {}

  clear(): void {
    this.clicked.emit(true);
    this._tagsService.clearScannedTags();
    this._storage.removeItem(scannedTagsKey);
    this.scanTagsCleared.emit(true);
    this._toast.info('All scanned items cleared');
  }
}

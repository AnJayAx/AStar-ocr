import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastService } from '@dis/services/message/toast.service';
import { DialogCloseEventType } from '@its/shared/constants/constants';
import { SubmitImageService } from '@its/shared/services/submit-image.service';
import { filter, from, map, Subject, takeUntil } from 'rxjs';
import { Utils } from '@its/shared/classes/utils';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { faTrash, faCancel } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-submission-dialog',
  templateUrl: './submission-dialog.component.html',
  styleUrls: ['./submission-dialog.component.scss'],
  providers: [SubmitImageService]
})
export class SubmissionDialogComponent implements OnInit, OnDestroy {
  faTrash = faTrash; faCancel = faCancel;
  Utils = Utils;
  DialogCloseEventType = DialogCloseEventType;
  private destroyed$: Subject<boolean> = new Subject();

  @Input() dialogTitle: string = 'sample title';
  @Input() transactionNo: string = '';
  @Input() isDraft: boolean;
  @Output() closeSelected: EventEmitter<DialogCloseEventType> = new EventEmitter();

  photoCountLimit: number = null; 
  photoCount: number = 0;
  photoBase64List: string[] = [];

  selectedPhotos: string[] = [];

  signatureBase64: string;

  constructor(
    private _submitimgService: SubmitImageService,
    private customDialog: CustomDialogService,
  ) {}

  ngOnInit(): void {
    this._submitimgService.getHHPhotoLimit().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (limit) => { 
        this.photoCountLimit = limit; 
      }
    });
  }

  onSelectImage(data: string) {
    this.selectedPhotos.push(data);
  }

  deselectImage(data: string) {
    this.removeFromSelectedPhotos(data);
  }

  showDeleteOption(data: string) {
    return this.selectedPhotos.includes(data);
  }

  deleteImage(data: string) {
    if (this.showDeleteOption(data)) {
      this.removeFromSelectedPhotos(data);
      const dataIdx = this.photoBase64List.findIndex(photoData => photoData === data);
      this.photoBase64List.splice(dataIdx, 1);
    }
  }

  private removeFromSelectedPhotos(data: string) {
    const selectedIdx = this.selectedPhotos.findIndex(photoData => photoData === data);
    this.selectedPhotos.splice(selectedIdx, 1);
  }

  onClickUploadPhoto() { this.getPictures(); }

  getPictures() {    
    const getPhotoObsvble = from(Camera.getPhoto({
      quality: 90,
      width: 400,
      source: CameraSource.Prompt,
      resultType: CameraResultType.Base64
    }));

    getPhotoObsvble.pipe(
      takeUntil(this.destroyed$),
      filter(photo => !!photo),
      map(photo => photo.base64String)
    ).subscribe({
      next: (imageString) => {
        this.selectedPhotos = [];
        this.photoBase64List.push(imageString);
      }
    });

  }

  getUpdatedSignature(signatureBase64: string) {
    this.signatureBase64 = signatureBase64;
  }

  close(type: DialogCloseEventType) {
     if (type === DialogCloseEventType.Submit) {
      let validated = true;
      if (this.photoLimitExceeded()) {
        validated = false;

        this.customDialog.message(
          'Submission Failed', `No more than ${this.photoCountLimit} photo(s) can be selected`,
          [{ text: 'Close', primary: false}], 'error'
        ).subscribe({
          next: () => {}
        });
      }

      if (!validated) {
        return;
      }

      if (this.signatureBase64?.length > 0 && this.photoBase64List?.length > 0) {
        this._submitimgService.postSignatureAndPhotoArray(this.signatureBase64, this.photoBase64List, this.transactionNo).subscribe({
          next: (res) => { console.log('submission dialog', res); }
        });
      }
      else if (this.signatureBase64?.length > 0) {
        this._submitimgService.postSignature(this.signatureBase64, this.transactionNo).subscribe({
          next: (res) => { console.log('submission dialog', res); }
        });
      }
      else if (this.photoBase64List?.toString().length > 0) {
        this._submitimgService.postPhotoArray(this.photoBase64List, this.transactionNo).subscribe({
          next: (res) => { console.log('submission dialog', res); }
        });
      }
    }

    this.closeSelected.emit(type);
  }

  photoLimitExceeded(): boolean {
    return this.photoBase64List.length > this.photoCountLimit;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

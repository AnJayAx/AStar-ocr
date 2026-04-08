import { Component, Input, OnInit } from '@angular/core';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-item-image',
  templateUrl: './item-image.component.html',
  styleUrls: ['./item-image.component.scss']
})
export class ItemImageComponent implements OnInit {
  private destroyed$: Subject<boolean> = new Subject();

  @Input() assetId: string;
  @Input() height: number = 150; 
  imageUrl: string;
  isLoading: boolean = true;

  constructor(
    private _itsService: ItsServiceService,
  ) {}

  ngOnInit(): void {
    if (this.assetId.length > 0) {
      this._itsService.getPhotoFile(this.assetId).pipe(takeUntil(this.destroyed$)).subscribe({
        next: (response) => {
          console.log('getPhotoFile response', response);
          const reader = new FileReader();
          reader.onloadend = () => {
            this.imageUrl = reader.result as string;
          };
          reader.readAsDataURL(response);
        },
        error: (err) => {
          console.error('getImageURL failed', err);
          this.onNoImageLoaded();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else if (this.assetId === "") {
      console.error('item-image error: No asset id passed;');
      this.onNoImageLoaded();
    }
  }

  private onNoImageLoaded(): void {
    this.imageUrl = 'assets/img/placeholder-600.png'
    this.isLoading = false;
  }

}

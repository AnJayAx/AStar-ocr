import { Component, Input, OnInit } from '@angular/core';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { ItsServiceService } from '@its/shared/services/its-service.service';

@Component({
  selector: 'app-item-display-card',
  templateUrl: './item-display-card.component.html',
  styleUrls: ['./item-display-card.component.scss']
})
export class ItemDisplayCardComponent implements OnInit {

  @Input() tagItem: ISelectedTag;

  isLoading: boolean = true;
  PLACEHOLDER_URL = 'https://placehold.co/110?text=No+Image+Found';
  imageUrl: string;
  printEPC: string;

  constructor(
    private _itsService: ItsServiceService,
  ) { }

  ngOnInit(): void {
    if (this.tagItem.EPC_ID) {
      this.printEPC = `***${this.tagItem.EPC_ID.substring(this.tagItem.EPC_ID.length - 6)}`;
    }

    this._itsService.getPhotoFile(this.tagItem.Asset_ID.toString()).subscribe({
      next: response => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imageUrl = reader.result as string;
        };
        reader.readAsDataURL(response);
      },
      error: err => {
        this.imageUrl = null;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

}

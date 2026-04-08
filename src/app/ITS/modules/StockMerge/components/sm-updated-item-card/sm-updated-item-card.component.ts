import { Component, Input, OnInit } from '@angular/core';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';

@Component({
  selector: 'app-sm-updated-item-card',
  templateUrl: './sm-updated-item-card.component.html',
  styleUrls: ['./sm-updated-item-card.component.scss']
})
export class SmUpdatedItemCardComponent implements OnInit {
  binIcon = faTrashCan;

  @Input() item: IItemInfo;

  SM: string;

  constructor() { }

  ngOnInit(): void {
    this.SM = this.item['IsIndividual'].toUpperCase();
  }

  sanitizeNullString(value: string) {
    return value?.length < 1 ? '-' : value;
  }

}

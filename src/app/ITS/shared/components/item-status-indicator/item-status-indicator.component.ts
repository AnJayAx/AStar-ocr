import { Component, Input, OnInit } from '@angular/core';
import { CommonStoreService } from '@its/shared/services/common-store.service';

enum ItemStatusName {
  Available = 'Available',
  Onloan = 'On Loan',
  NotAvailable = 'NotAvailable',
  Scrapped = 'Scrapped',
  InTransit = 'In-Transit',
  OnHold = 'On Hold',
  Refurbished = 'Refurbished'
};

@Component({
  selector: 'app-item-status-indicator',
  templateUrl: './item-status-indicator.component.html',
  styleUrls: ['./item-status-indicator.component.scss']
})
export class ItemStatusIndicatorComponent implements OnInit {
  ItemStatusName = ItemStatusName;
  onHoldStatus: string = this._commonstore.currentInboundVerifyStatus;

  @Input() statusName: string;

  constructor(
    private _commonstore: CommonStoreService
  ) {}

  ngOnInit(): void {}

}

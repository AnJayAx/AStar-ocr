import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IPLListItem } from '@its/shared/interfaces/frontend/PLListItem';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FifoType } from '../../pickinglist.constants';
import { PlFifoService } from '../../services/pl-fifo.service';
import { PlSelectedTaglistService } from '@its/modules/PickingList/services/pl-selected-taglist.service';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pl-listitem-card',
  templateUrl: './pl-listitem-card.component.html',
  styleUrls: ['./pl-listitem-card.component.scss'],
  providers: [PlFifoService]
})
export class PlListitemCardComponent implements OnInit, OnDestroy {
  FifoType = FifoType;
  outOfStockIcon = faExclamationTriangle;
  private destroyed$: Subject<boolean> = new Subject();
  
  @Input() item: IPLListItem;

  constructor(
    private router: Router,
    private _pltaglistService: PlSelectedTaglistService,
  ) {}

  get isOutOfStock(): boolean { return !!this.item && this.item.Location.length === 0; }
  get showExpiry(): boolean { return this.item.Date_of_Expire?.length > 0; }  // Implementation with FIFO: return this.fifoSetting === FifoType.ExpiryDate && this.item.Date_of_Expire?.length > 0;
  get showBatchNo(): boolean { return this.item.BatchNo?.length > 0; }  // Implementation with FIFO: return this.fifoSetting === FifoType.BatchNo && this.item.BatchNo?.length > 0;

  ngOnInit(): void {}

  onNavToTagsPage(): void {
    this._pltaglistService.setSelectedTagList(this.item);
    this.router.navigate(['/pl-taglist']);
  }

  get showNavBtn(): boolean { return !this.isOutOfStock && this.item.TagItems.length > 0; }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

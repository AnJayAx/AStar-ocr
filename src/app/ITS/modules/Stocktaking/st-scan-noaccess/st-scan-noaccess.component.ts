import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { Subject } from 'rxjs';
import { STStatus } from '../stocktaking.constants';
import { NoaccessStlistService } from './noaccess-stlist.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-st-scan-noaccess',
  templateUrl: './st-scan-noaccess.component.html',
  styleUrls: ['./st-scan-noaccess.component.scss'],
  providers: [NoaccessStlistService]
})
export class StScanNoaccessComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  filterBy: STStatus;
  listItems: ISTItem[];

  constructor(
    private _noaccessListService: NoaccessStlistService,
    private _layoutService: LayoutService
  ) {
    this.filterBy = STStatus.NoAccess;
    this.listItems = [];
    this._layoutService.changeTitleDisplayAndSetNavBackPath('No Access', 'st-scan');
  }

  ngOnInit(): void {
    this.loadListItems();
  }

  private loadListItems(): void {
    this._noaccessListService.getNoAccessList().subscribe({
      next: (items) => { this.listItems = items; },
      error: (error) => { console.error(`st-scan-noaccess error: ${error}`); }
    });
  }

  listItemsIsAvailable() { return this.listItems && this.listItems.length > 0; }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

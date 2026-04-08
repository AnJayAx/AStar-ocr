import { Component, OnDestroy, OnInit } from '@angular/core';
import { PagerSettings } from '@progress/kendo-angular-listview/models/pager-settings';
import { Subject } from 'rxjs';
import { STStatus } from '../stocktaking.constants';
import { NotregisteredStlistService } from './notregistered-stlist.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-st-scan-notregistered',
  templateUrl: './st-scan-notregistered.component.html',
  styleUrls: ['./st-scan-notregistered.component.scss'],
  providers: [NotregisteredStlistService]
})
export class StScanNotregisteredComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  filterBy: STStatus;
  listItems: string[];  /* contains EPC IDs only */

  public pagerSettings: PagerSettings = {
    previousNext: true,
    type: 'input',
  };
  public pageSize = 10;

  constructor(
    private _notregisteredListService: NotregisteredStlistService,
    private _layoutService: LayoutService
  ) {
    this.filterBy = STStatus.NotRegistered;
    this.listItems = [];
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Not Registered', 'st-scan');
  }

  ngOnInit(): void {
    this.loadListItems();
  }

  private loadListItems(): void {
    this._notregisteredListService.getNotRegisteredTagList().subscribe({
      next: (tags) => { this.listItems = tags; },
      error: (error) => { console.error(`st-scan-notregistered error: ${error}`); }
    });
  }

  showListItems(): boolean { return this.listItems && this.listItems.length > 0; }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISTItem } from '@its/shared/interfaces/backend/SPT_Doc/STItem';
import { Subject, takeUntil } from 'rxjs';
import { ExcessStlistService } from './excess-stlist.service';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-st-scan-excess',
  templateUrl: './st-scan-excess.component.html',
  styleUrls: ['./st-scan-excess.component.scss'],
  providers: [ExcessStlistService]
})
export class StScanExcessComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  listItems: ISTItem[] = [];

  constructor(
    private _excesslistService: ExcessStlistService,
    private _layoutService: LayoutService,
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Excess', 'st-scan');
  }

  ngOnInit(): void { 
    this.loadListItems(); 
  }

  private loadListItems(): void {
    this._excesslistService.getExcessList().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (items) => { this.listItems = items; }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { filter, map, Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-item-info',
  templateUrl: './item-info.component.html',
  styleUrls: ['./item-info.component.scss']
})
export class ItemInfoComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  
  @Input() public itemEPC: string;
  @Input() public itemAssetID: number | string;
  item: IItemInfo;
  itemNotFound: boolean = false;

  formfieldTitlesDictionary: { [db: string]: string } = {};
  get isFormFieldTitlesDictionaryLoaded(): boolean { return Object.keys(this.formfieldTitlesDictionary).length > 0; }

  getItem(epcID: string): Observable<IItemInfo> {
    return this._itsService.postItemsByEpcId([{ EPC_ID: epcID }]).pipe(
      tap((itemInfoArr) => { this.itemNotFound = !(itemInfoArr.length > 0); }),
      filter((itemInfoArr) => itemInfoArr.length > 0),
      map((itemInfoArr) => itemInfoArr[0])
    )
  }

  constructor(
    private _itsService: ItsServiceService,
  ) {}
  
  ngOnInit(): void {
    this._itsService.getDataBinding().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (dataBindings) => {
        dataBindings.forEach(binding => {
          this.formfieldTitlesDictionary[binding.DB_Field] = binding.HH_Display_Name;
        });
      }
    });

    this.getItem(this.itemEPC).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (item) => { this.item = item; console.log('[item-info] item', this.item); }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}

import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { Utils } from '@its/shared/classes/utils';
import { IHHSplit } from '@its/shared/interfaces/backend/HHSplit';
import { IRepack } from '@its/shared/interfaces/backend/Repack';
import { ISelectedTag } from '@its/shared/interfaces/frontend/selectedTags';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { Observable, BehaviorSubject, filter, map, switchMap, tap, combineLatest, distinctUntilChanged } from 'rxjs';

@Injectable()
export class ItemsplitService {

  constructor(
    private _tagsService: ScannedTagsService,
    private _itsService: ItsServiceService,
    private _itsdialog: ItsDialogService,
    private route: ActivatedRoute,
    private _customdialog: CustomDialogService,
  ) { }

  splitItem$(): Observable<ISelectedTag> {
    return this.route.queryParamMap.pipe(
      map(params => params.get('loadItem')),
      map(data => JSON.parse(data) as ISelectedTag)
    );
  }

  private incomingTags$(): Observable<{ valid: string[], invalid: string[] }> {

    const allTags$ = this.splitItem$().pipe(
      filter(item => !!item),
      switchMap(() => this._tagsService.scannedTags$),
      tap(tags => console.log("is-split incoming tags", tags))
    );

    const existingTags$ = allTags$.pipe(
      switchMap(tags => {
        const tagsParam = tags.map(tag => { return { "EPC_ID": tag } });
        return this._itsService.postItemsByEpcId(tagsParam);
      }),
      map(itemInfoArr => itemInfoArr.map(item => item.EPC_ID))
    );

    return combineLatest({
      allTags: allTags$,
      existingTags: existingTags$
    }).pipe(
      map(values => {
        if (values.allTags.length > 0) {
          return {
            valid: values.allTags.filter(tag => !values.existingTags.includes(tag)),
            invalid: values.existingTags
          }
        } else {
          return {
            valid: [], invalid: []
          }
        }
      })
    );
  }

  validTags$(): Observable<string[]> {
    return this.incomingTags$().pipe(
      map(tags => tags.valid),
    );
  }

  invalidTagsDialog$(): Observable<any> {
    const invalidTagsDialog = (invalidTags: string[]) => {
      return this._customdialog.messageHTML(
        'Invalid Tags', Utils.getUnorderedListHTML(invalidTags),
        [{ text: 'Close', primary: false }], 'warning'
      );
    }

    return this.incomingTags$().pipe(
      map(tags => tags.invalid),
      filter(tags => tags?.length > 0),
      switchMap(tags => invalidTagsDialog(tags))
    );
  }

  clearTags(): void {
    this._tagsService.clearScannedTags();
  }

  postItemSplit(itemSplitItems: IHHSplit): Observable<any> {
    return this._itsService.postHHSplit(itemSplitItems).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

  postRepackItem(repackItem: IRepack): Observable<any> {
    console.log('postRepack > repackItem', repackItem);
    return this._itsService.postRepackItem(repackItem).pipe(switchMap(res => this._itsdialog.postByHH(res)));
  }

}

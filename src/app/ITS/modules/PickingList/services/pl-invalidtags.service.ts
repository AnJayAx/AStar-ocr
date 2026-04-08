import { Injectable } from '@angular/core';
import { Utils } from '@its/shared/classes/utils';
import { Observable, tap, switchMap, BehaviorSubject, of, filter, takeUntil } from 'rxjs';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class PlInvalidtagsService {

  private invalidTagsSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private invalidTags$: Observable<string[]> = this.invalidTagsSubject.asObservable();

  constructor(
    private _customdialog: CustomDialogService,
  ) {}

  setInvalidTags(tags: string[]): void {
    console.log('[pl-invalidtags svc] setInvalidTags', tags);
    this.invalidTagsSubject.next(tags);
  }

  invalidTagsDialog$(): Observable<any> {
    const invalidTagsDialog = (invalidTags: string[]) => {
      return this._customdialog.messageHTML(
        'Invalid Tags', Utils.getUnorderedListHTML(invalidTags),
        [{ text: 'Close', primary: false }], 'warning'
      );
    }

    return this.invalidTags$.pipe(
      filter(tags => tags.length > 0),
      switchMap(tags => invalidTagsDialog(tags)),
      tap(response => console.log('[pl-invalidtags svc] invalidTagsDetected()', response)),
    );
  }

  onInvalidTagsViewed(): void {
    console.log('[pl-invalidtags svc] onInvalidTagsViewed');
    this.invalidTagsSubject.next([]);
  }
}

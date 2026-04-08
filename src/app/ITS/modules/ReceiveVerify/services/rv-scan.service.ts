import { Injectable } from '@angular/core';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { filter, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RvScanService {

  constructor(
    private _tagsService: ScannedTagsService,
  ) { }

  getIncomingTags(): Observable<string[]> {
    return this._tagsService.scannedTags$.pipe(
      filter(tags => tags.length > 0),
      map(tags => [...new Set(tags)])
    );
  }

  isScanInProgress(): Observable<boolean> {
    return this._tagsService.scannedTags$.pipe(
      map(tags => tags?.length > 0 ? true : false),
      tap(inProgress => console.log('isScanInProgress', inProgress))
    );
  }

  clearTags(isClear: boolean = true): void {
    if (isClear) {
      this._tagsService.clearScannedTags();
    } else {
      this._tagsService.resetTagsService();
    }
  }

}

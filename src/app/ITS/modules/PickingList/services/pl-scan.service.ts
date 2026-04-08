import { Injectable } from '@angular/core';
import { ScannedTagsService } from '@its/shared/services/scanned-tags.service';
import { takeUntil, tap } from 'rxjs';
import { PlResetService } from './pl-reset.service';

@Injectable({
  providedIn: 'root'
})
export class PlScanService {

  plListScannedTags$ = this._tagsService.scannedTags$.pipe(
    takeUntil(this._resetService.plModuleDestroyed$),
    tap(tags => console.log('[pl-scan service] tags', tags)),
  );

  constructor(
    private _tagsService: ScannedTagsService,
    private _resetService: PlResetService,
  ) {}
}

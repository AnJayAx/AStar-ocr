import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { faCalendarWeek, faCircleInfo, faFile, faFileLines, faPencil, faUser } from '@fortawesome/free-solid-svg-icons';
import { MroHistoryEntry } from '@its/shared/interfaces/backend/MROHistory';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { CsUtils } from '../cs-utils';

@Component({
  selector: 'app-cs-mro-history',
  templateUrl: './cs-mro-history.component.html',
  styleUrls: ['./cs-mro-history.component.scss']
})
export class CsMroHistoryComponent implements OnInit {
  dateIcon = faCalendarWeek;
  descriptionIcon = faCircleInfo;

  @Input() itemAssetID: string;

  mroRecords: MroHistoryEntry[];

  constructor(
    private _itsService: ItsServiceService,
    private ref: ChangeDetectorRef,
  ) { }

  noMroRecordsFound(): boolean {
    return !!this.mroRecords && this.mroRecords.length === 0;
  }

  getDateFromDateS(dateString: string): string {
    return CsUtils.getDateFromDateS(dateString);
  }

  getTimeFromDateS(dateString: string): string {
    return CsUtils.getTimeFromDateS(dateString);
  }

  ngOnInit(): void {
    this._itsService.getMROHistoryByAssetId(this.itemAssetID).subscribe({
      next: (mroHistory) => {
        this.mroRecords = mroHistory;
        console.log('mroHistory', mroHistory);
        this.ref.detectChanges();
      }
    });
  }

}

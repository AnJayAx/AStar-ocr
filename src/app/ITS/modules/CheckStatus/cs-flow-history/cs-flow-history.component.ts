import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { faCalendarWeek, faCircleInfo, faUser } from '@fortawesome/free-solid-svg-icons';
import { FlowHistoryEntry } from '@its/shared/interfaces/backend/FlowHistory';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { CsUtils } from '../cs-utils';

@Component({
  selector: 'app-cs-flow-history',
  templateUrl: './cs-flow-history.component.html',
  styleUrls: ['./cs-flow-history.component.scss']
})
export class CsFlowHistoryComponent implements OnInit {
  userIcon = faUser;
  dateIcon = faCalendarWeek;
  remarksIcon = faCircleInfo;

  @Input() itemAssetID: string;

  flowRecords: FlowHistoryEntry[];

  constructor(
    private _itsService: ItsServiceService,
    private ref: ChangeDetectorRef,
  ) { }

  noFlowRecordsFound(): boolean {
    return this.flowRecords?.length === 0;
  }

  getDateFromDateS(dateString: string): string {
    return CsUtils.getDateFromDateS(dateString);
  }

  getTimeFromDateS(dateString: string): string {
    return CsUtils.getTimeFromDateS(dateString);
  }

  ngOnInit(): void {
    this._itsService.getFlowHistoryByAssetId(this.itemAssetID).subscribe({
      next: (flowHistory) => {
        this.flowRecords = flowHistory;
        this.ref.detectChanges();
      }
    });
  }

}

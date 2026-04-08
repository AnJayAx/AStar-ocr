import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '@dis/services/layout/layout.service';

@Component({
  selector: 'app-check-status2-info-router',
  templateUrl: './check-status2-info-router.component.html',
  styleUrls: ['./check-status2-info-router.component.scss']
})
export class CheckStatus2InfoRouterComponent implements OnInit {
  CheckStatusList = ['Item Info', 'MRO History', 'Flow History' ];

  selected: string = 'Item Info';

  itemEPC: string;
  itemAssetID: string;

  constructor(
    private route: ActivatedRoute,
    private _layoutService: LayoutService
  ) {
    this._layoutService.changeTitleDisplayAndSetNavBackPath('Check Status', 'checkstatus');
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe({
      next: (params) => {
        this.itemEPC = params.get('epc');
        this.itemAssetID = params.get('assetID');
      }
    });
  }

  onClick(userSelection: string) {
    this.selected = userSelection;
  }

}

import { Component, OnInit } from '@angular/core';
import { MocksLocalService } from '@dis/services/mocks/mocks.service';

@Component({
  selector: 'app-sample-page',
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss'],
  providers: [MocksLocalService]
})
export class SamplePageComponent implements OnInit {
  constructor(private _mocksLocalService: MocksLocalService) {}

  data = this._mocksLocalService.getSampleDataForGrid();

  ngOnInit(): void {}
}

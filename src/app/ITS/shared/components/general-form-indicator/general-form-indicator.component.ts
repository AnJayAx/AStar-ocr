import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-general-form-indicator',
  templateUrl: './general-form-indicator.component.html',
  styleUrls: ['./general-form-indicator.component.scss']
})
export class GeneralFormIndicatorComponent implements OnInit {

  @Input() epcTag: string;
  @Input() SM: string;
  @Input() cate: string;
  @Input() description: string;
  @Input() location: string;
  @Input() assetId: string;
  @Input() assetNo: string;
  @Input() quantity: number;

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit } from '@angular/core';
import {APP_OPTIONS} from '@dis/settings/behavior.config';

@Component({
  selector: 'app-custom-ui-blocker',
  templateUrl: './custom-ui-blocker.component.html',
  styleUrls: ['./custom-ui-blocker.component.scss']
})
export class CustomUiBlockerComponent implements OnInit {

  options: any;

  constructor() {

  }

  ngOnInit(): void {
    this.options = APP_OPTIONS.blockUI;
  }
}

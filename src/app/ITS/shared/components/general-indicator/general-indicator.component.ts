import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { InternalItsServiceService } from '../../services/internal-its-service.service';

@Component({
  selector: 'app-general-indicator',
  templateUrl: './general-indicator.component.html',
  styleUrls: ['./general-indicator.component.scss']
})
export class GeneralIndicatorComponent implements OnInit {

  @Input() epcTag: string;
  @Input() SM: string;
  @Input() cate: string;
  @Input() description: string;
  @Input() location: string;
  @Input() assetId: string;
  @Input() assetNo: string;
  @Input() quantity: number;
  @Input() availability: string;
  @Input() status: 'success'|'warning'|'error';

  soloSelected: boolean = false;

  isMultiple: boolean = false;

  @Output() updateSelectAll= new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  Navigateto = function() {
    if (!this.nextRouteLink) { return; }
    this.router.navigateByUrl(this.nextRouteLink);
  };

  toggle(event) {
    if ( event.target.checked ) { this.soloSelected = true;}
    else {
      this.soloSelected = false;
      this.updateSelectAll.emit({"update": false});
    }
  }
}

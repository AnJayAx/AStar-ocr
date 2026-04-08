import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sm-indicator',
  templateUrl: './sm-indicator.component.html',
  styleUrls: ['./sm-indicator.component.scss']
})
export class SmIndicatorComponent implements OnInit {

  @Input() sm: string;
  SM: string;

  constructor() { }

  ngOnInit(): void {
    this.SM = this.sm.toString().toUpperCase();
  }

  isM() {
    return this.SM === 'M';
  }
}

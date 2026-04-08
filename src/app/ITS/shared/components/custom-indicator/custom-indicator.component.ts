import { Component, Input, OnInit } from '@angular/core';
import { IconDefinition, faCircleQuestion, faExclamationCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export enum IndicatorType {
  ExclamationTriangle, ExclamationCircle, QuestionCircle
}

export enum IndicatorColour {
  Red
}

@Component({
  selector: 'app-custom-indicator',
  templateUrl: './custom-indicator.component.html',
  styleUrls: ['./custom-indicator.component.scss']
})
export class CustomIndicatorComponent implements OnInit {

  @Input() type: IndicatorType;
  @Input() colour: IndicatorColour;
  faIcon: IconDefinition;
  colourClass: string;

  showIndicator(): boolean {
    return !!this.faIcon && !!this.colourClass;
  }

  constructor() {}

  ngOnInit(): void {
    switch (this.type) {
      case IndicatorType.ExclamationCircle:
        this.faIcon = faExclamationCircle; break;
      case IndicatorType.ExclamationTriangle:
        this.faIcon = faExclamationTriangle; break;
      case IndicatorType.QuestionCircle:
        this.faIcon = faCircleQuestion; break;
    }

    switch(this.colour) {
      case IndicatorColour.Red:
        this.colourClass = 'red'; break;
    }
  }

}

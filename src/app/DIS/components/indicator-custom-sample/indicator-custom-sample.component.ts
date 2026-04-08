import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-indicator-custom-sample',
  templateUrl: './indicator-custom-sample.component.html',
  styleUrls: ['./indicator-custom-sample.component.scss']
})


export class IndicatorCustomSampleComponent implements OnInit {
  @Input() name: string;
  @Input() group: string;
  @Input() callout: string;
  @Input() details: string[];
  @Input() size: string;
  @Input() status: 'success'|'warning'|'error';
  @Input() nextRouteLink: string;


  constructor(private router: Router) {
  }
  Navigateto = function() {
    if (!this.nextRouteLink) {
      return;
    }

    this.router.navigateByUrl(this.nextRouteLink);
};
  ngOnInit(): void {}
}

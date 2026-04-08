import { Component, OnInit } from '@angular/core';
import { FontSizeService } from '@dis/services/fontsize/font-size.service';
import {LegendLabelsContentArgs} from '@progress/kendo-angular-charts';
import {IntlService} from '@progress/kendo-angular-intl';


@Component({
  selector: 'app-dashboard-two',
  templateUrl: './dashboard-two.component.html',
  styleUrls: ['./dashboard-two.component.scss']
})
export class DashboardTwoComponent implements OnInit {

  public pieData: any[] = [
    { category: '0-14', value: 0.2545 },
    { category: '15-24', value: 0.1552 },
    { category: '25-54', value: 0.4059 },
    { category: '55-64', value: 0.0911 },
    { category: '65+', value: 0.0933 },
  ];


  constructor(private intl: IntlService) { }

  ngOnInit(): void {
    this.labelContent = this.labelContent.bind(this);
  }

  labelContent(args: LegendLabelsContentArgs): string {
    return `${args.dataItem.category} years old: ${this.intl.formatNumber(
      args.dataItem.value,
      'p2'
    )}`;
  }

}

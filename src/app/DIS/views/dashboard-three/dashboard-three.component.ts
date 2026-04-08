import {Component, OnInit, ViewChild} from '@angular/core';
import {DataBindingDirective} from '@progress/kendo-angular-grid';
import {employees} from '@dis/services/mocks/sampleDataForGrid';
import { process } from '@progress/kendo-data-query';

@Component({
  selector: 'app-dashboard-three',
  templateUrl: './dashboard-three.component.html',
  styleUrls: ['./dashboard-three.component.scss']
})
export class DashboardThreeComponent implements OnInit {


  constructor() { }


  data: any[] = [
    {
      kind: 'Hydroelectric',
      share: 0.175,
    },
    {
      kind: 'Nuclear',
      share: 0.238,
    },
    {
      kind: 'Coal',
      share: 0.118,
    },
    {
      kind: 'Solar',
      share: 0.052,
    },
    {
      kind: 'Wind',
      share: 0.225,
    },
    {
      kind: 'Other',
      share: 0.192,
    },
  ];

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  public gridData: any[] = employees;
  public gridView: any[];

  public mySelection: string[] = [];

  labelContent(e: any): string {
    return e.category;
  }



  public onFilter(inputValue: string): void {

    this.gridView = process(this.gridData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: 'full_name',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'job_title',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'budget',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'phone',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'address',
            operator: 'contains',
            value: inputValue,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }

  // private photoURL(dataItem: any): string {
  //   const code: string = dataItem.img_id + dataItem.gender;
  //   // const image: any = images;
  //
  //   return image[code];
  // }
  //
  // private flagURL(dataItem: any): string {
  //   const code: string = dataItem.country;
  //   // const image: any = images;
  //
  //   return image[code];
  // }

  ngOnInit(): void {
    this.gridView = this.gridData;
  }

}

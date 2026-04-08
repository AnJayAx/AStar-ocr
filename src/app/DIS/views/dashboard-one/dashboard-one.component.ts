import { Component, Input, OnInit } from '@angular/core';
import {MocksLocalService} from '@dis/services/mocks/mocks.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard-one',
  templateUrl: './dashboard-one.component.html',
  styleUrls: ['./dashboard-one.component.scss']
})
export class DashboardOneComponent implements OnInit {
  data: any = [];

  constructor(private mocksLocalService: MocksLocalService , private router: Router) { 
  }; 

  Navigateto= function (url) {
    this.router.navigateByUrl(url);
};


  ngOnInit(): void {
    this.data = [...this.mocksLocalService.getSampleDataForGrid(), ...this.mocksLocalService.getSampleDataForGrid()];
  }
}

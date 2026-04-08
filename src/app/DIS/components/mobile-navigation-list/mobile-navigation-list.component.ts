import { Component, OnInit } from '@angular/core';
import {config} from "@dis/settings/sidebar.config";
import {Router} from "@angular/router";

@Component({
  selector: 'app-mobile-navigation-list',
  templateUrl: './mobile-navigation-list.component.html',
  styleUrls: ['./mobile-navigation-list.component.scss']
})
export class MobileNavigationListComponent implements OnInit {

  selected = 0;
  items: any = [
    ...config
  ];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }


  navigate(item): void {
    console.log(item.link);
    this.router.navigate([item.link]);
  }

}

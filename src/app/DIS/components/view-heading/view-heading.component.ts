import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-heading',
  templateUrl: './view-heading.component.html',
  styleUrls: ['./view-heading.component.scss']
})
export class ViewHeadingComponent implements OnInit {
  constructor() {}

  @Input()
  title: string;

  @Input()
  subtitle: string;

  @Input()
  previousRouteLink: string;

  ngOnInit(): void {}
}

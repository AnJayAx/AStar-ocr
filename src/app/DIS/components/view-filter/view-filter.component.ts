import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-filter',
  templateUrl: './view-filter.component.html',
  styleUrls: ['./view-filter.component.scss']
})
export class ViewFilterComponent implements OnInit {
  constructor() {}

  @Input()
  icon: string;

  @Input()
  label: string;

  ngOnInit(): void {}
}

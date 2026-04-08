import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cs-item-info',
  templateUrl: './cs-item-info.component.html',
  styleUrls: ['./cs-item-info.component.scss']
})
export class CsItemInfoComponent implements OnInit {

  @Input() itemEPC: string;
  @Input() itemAssetID: number | string;

  constructor() {}

  ngOnInit(): void {}
}

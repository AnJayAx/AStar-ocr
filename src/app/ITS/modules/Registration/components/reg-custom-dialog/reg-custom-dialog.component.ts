import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-reg-custom-dialog',
  templateUrl: './reg-custom-dialog.component.html',
  styleUrls: ['./reg-custom-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegCustomDialogComponent implements OnInit {

  @Input() htmlStr: string;
  
  constructor() { }

  ngOnInit(): void {
  }

}

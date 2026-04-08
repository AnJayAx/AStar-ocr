import { Component, OnInit } from '@angular/core';
import {CustomDialogService} from '@dis/services/message/custom-dialog.service';
import {data} from '@dis/services/mocks/sampleDataForGrid';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-input-fields',
  templateUrl: './input-fields.component.html',
  styleUrls: ['./input-fields.component.scss']
})
export class InputFieldsComponent implements OnInit {

  constructor(private customDialog: CustomDialogService) { }

  listItems: Array<string> = [
    'Baseball',
    'Basketball',
    'Cricket',
    `Field Hockey`,
    'Football',
    'Table Tennis',
    'Tennis',
    'Volleyball',
  ];
  autoCorrect = false;
  value = 5;
  dateValue: Date = new Date(2019, 5, 1, 22);
  format = 'MM/dd/yyyy HH:mm';
  terms: any;
  gender: any;
  textAreaWithColsValue: any;
  view: any[];
  myGroup: FormGroup;


  ngOnInit(): void {
    this.view = data;
    this.myGroup = new FormGroup({
      textbox: new FormControl(),
      combobox: new FormControl(),
      numerictextbox: new FormControl(),
      datetime: new FormControl(new Date()),
      checkbox: new FormControl(),
      gender: new FormControl(),
      textarea: new FormControl(),
    });
  }

  test(): void{
    this.customDialog.message('My Title', 'this is a good luck message',
      [{text: 'Yes', primary: true}, {text: 'Maybe', primary: false}, {text: 'No', primary: false}], 'error').subscribe(res => {
      console.log(res);
    });
  }

}

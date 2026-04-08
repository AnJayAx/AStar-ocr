import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

/* Object-only search */
@Component({
  selector: 'app-autocompletesearch-object-input',
  templateUrl: './autocompletesearch-object-input.component.html',
  styleUrls: ['./autocompletesearch-object-input.component.scss']
})
export class AutocompletesearchObjectInputComponent implements OnInit {
  @Input() listItems: any[];
  @Input() searchTerm: string;
  @Output() viewChanged: EventEmitter<any[]>;

  viewListItems: any[];
  sourceSearchItems: string[];
  searchItems: string[];
  selectedItems: any[];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };

  constructor() { }

  ngOnInit(): void {
  }

}

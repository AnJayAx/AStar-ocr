import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataItem } from '@its/shared/interfaces/frontend/DataItem';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-autocompletesearch-input',
  templateUrl: './autocompletesearch-input.component.html',
  styleUrls: ['./autocompletesearch-input.component.scss']
})
export class AutocompletesearchInputComponent implements OnInit {
  @Input() listItems: DataItem[];
  @Input() searchTerm: string;
  @Output() viewChanged: EventEmitter<DataItem[]>;

  viewListItems: DataItem[];
  sourceSearchItems: string[];
  searchItems: string[];
  selectedItems: DataItem[];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };

  constructor() { this.viewChanged = new EventEmitter(); }

  ngOnInit(): void {
    this.sourceSearchItems = this.listItems.map(x => x.label);
    this.searchItems = [...this.sourceSearchItems];
    this.viewListItems = [...this.listItems];
  }

  handleSearchFilterChange(searchTerm: string): void {
    this.searchItems = this.sourceSearchItems.filter((s) => s.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    if (searchTerm == '') { this.viewListItems = this.listItems.slice(); }
    this.viewChanged.emit(this.viewListItems);
  }

  handleSearchValueChange(searchTerm: string): void {
    this.viewListItems = this.listItems.filter((s) => s.label.toLowerCase() === searchTerm.toLowerCase());
    this.viewChanged.emit(this.viewListItems);
  }

}

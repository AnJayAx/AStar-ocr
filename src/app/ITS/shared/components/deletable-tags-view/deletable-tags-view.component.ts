import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { faTrashCan, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Utils } from '@its/shared/classes/utils';
import { trashIcon } from '@progress/kendo-svg-icons';

const SELECT_TEXT = 'Select All';
const UNSELECT_TEXT = 'Unselect All';

@Component({
  selector: 'app-deletable-tags-view',
  templateUrl: './deletable-tags-view.component.html',
  styleUrls: ['./deletable-tags-view.component.scss']
})
export class DeletableTagsViewComponent implements OnInit, OnChanges {
  expandIcon = faUpRightAndDownLeftFromCenter;
  trashIcon = trashIcon;
  faTrashIcon = faTrashCan;
  @ViewChild('listview') listview;

  @Input() isExpanded: boolean = false;
  @Input() tags: string[];
  @Input() smIndicatorType: 's'|'m'|'none' = 'none';
  @Output() dialogExpanded: EventEmitter<boolean> = new EventEmitter();
  @Output() tagDeleted: EventEmitter<string> = new EventEmitter();
  @Output() tagsDeleted: EventEmitter<string[]> = new EventEmitter();

  viewTags: string[];
  keyword: string = '';
  private selectedTags: string[] = [];
  selectionText: string;

  constructor() {
    this.loadSelectionText();
  }

  ngOnInit(): void {
    this.viewTags = [...this.tags];
  }

  ngOnChanges(): void {
    if (!!this.tags) {
      this.viewTags = [...this.tags];
    }
  }

  isSelectedItem(dataItem: string): boolean {
    return this.selectedTags.includes(dataItem);
  }

  onSelectItem(e: any, dataItem: string): void {
    if (e.target.checked) {
      this.selectedTags.push(dataItem);
    } else {
      this.selectedTags = this.selectedTags.filter(tags => tags !== dataItem);
    }
    this.loadSelectionText();
  }

  onSelectionBtnClick(): void {
    if (this.selectedTags.length !== 0) { this.selectedTags = []; }
    else { this.selectedTags = [...this.tags]; }
    this.loadSelectionText();
  }
  
  onTagDelete(deletedTag: string) {
    this.tagDeleted.emit(deletedTag);
  }

  onTagsDelete() {
    this.tagsDeleted.emit(this.selectedTags);
  }

  onExpand() {
    this.dialogExpanded.emit(true);
  }

  handleFilterChange(searchInput: string, listview) {
    listview.skip = 0;

    const normalizedQuery = Utils.normalized(searchInput);

    const filterExpression = (data: string) => {
      return Utils.normalized(data).includes(normalizedQuery);
    }

    this.viewTags = this.tags.filter(filterExpression);
  }

  hideList(): boolean { return !this.tags || this.tags.length == 0; }
  searchIsEmpty(): boolean { return this.viewTags?.length == 0; }

  private loadSelectionText(): void {
    this.selectionText = this.selectedTags.length > 0 ? UNSELECT_TEXT : SELECT_TEXT;
  }

}

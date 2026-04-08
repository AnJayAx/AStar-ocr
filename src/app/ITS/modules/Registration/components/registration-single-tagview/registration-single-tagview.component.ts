import { ChangeDetectionStrategy, Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-registration-single-tagview',
  templateUrl: './registration-single-tagview.component.html',
  styleUrls: ['./registration-single-tagview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSingleTagviewComponent implements OnInit {

  @Input() epcTag: string;
  @Input() isSelected: boolean = false;
  
  @Output() tagDeleted: EventEmitter<string> = new EventEmitter();
  @Output() updateSelectAll = new EventEmitter();
  @Output() tagSelected: EventEmitter<boolean> = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
  }

  onTagDelete() {
    this.tagDeleted.emit(this.epcTag);
  }

  toggle(event) {
    this.isSelected = event.target.checked;
    this.tagSelected.emit(this.isSelected);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-custom-switch',
  templateUrl: './custom-switch.component.html',
  styleUrls: ['./custom-switch.component.scss']
})
export class CustomSwitchComponent implements OnInit {

  @Input() isToggled: boolean = false;
  @Input() altModeEnabled: boolean = false;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter(false);

  constructor() { }

  ngOnInit(): void {
  }

  onToggle(isToggled: boolean) {
    console.log('toggle', isToggled);
    this.toggled.emit(isToggled);
  }

}

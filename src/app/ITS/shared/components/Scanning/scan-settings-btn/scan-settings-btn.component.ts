import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ScanSettingsComponent } from '../scan-settings/scan-settings.component';

@Component({
  selector: 'app-scan-settings-btn',
  templateUrl: './scan-settings-btn.component.html',
  styleUrls: ['./scan-settings-btn.component.scss']
})
export class ScanSettingsBtnComponent implements OnInit {
  gear = faGear;
  @ViewChild("container", { read: ViewContainerRef })
  public containerRef: ViewContainerRef;
  
  constructor(
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
  }

  toggleSettings(): void {
    const dialog: DialogRef = this.dialogService.open({
      title: 'Settings',
      content: ScanSettingsComponent,   
    });
  }

}

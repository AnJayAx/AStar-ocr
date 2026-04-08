import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastService } from '@dis/services/message/toast.service';

@Component({
  selector: 'app-floating-scan-button',
  templateUrl: './floating-scan-button.component.html',
  styleUrls: ['./floating-scan-button.component.scss']
})
export class FloatingScanButtonComponent implements OnInit {

  deviceName;
  data = [];
  isContinuousScan = false;

  constructor(private toastr: ToastService, private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  async scanForTag() {
    // RFIDPlugin.ts.connect()
  }
}

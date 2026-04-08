import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ItsDialogService } from '@its/shared/services/its-dialog.service';

@Component({
  selector: 'app-home-btn',
  templateUrl: './home-btn.component.html',
  styleUrls: ['./home-btn.component.scss']
})
export class HomeBtnComponent implements OnInit {

  @Input() isDarkBackground: boolean = false;
  @Output() returnHomeSelected: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private router: Router,
    private _itsdialog: ItsDialogService,
  ) { }

  ngOnInit(): void {}

  goHome() {
    this._itsdialog.genericConfirmAction('Confirm Action', 'Return to Main Menu?').subscribe({
      next: (response) => {
        if (response.primary) {
          localStorage.removeItem('productLotNo');   //Clear productLotNo before navigating
          this.router.navigateByUrl('/mainmenunew');
        }
      }
    });
  }
}

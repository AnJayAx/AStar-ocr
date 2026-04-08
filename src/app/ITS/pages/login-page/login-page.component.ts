import { tempUsername, tempPassword } from '../../temp-user-details';
import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {DialogModule, WindowModule} from '@progress/kendo-angular-dialog';

import {DialogService} from '@progress/kendo-angular-dialog';
import {Observable} from 'rxjs';

import { CustomDialogService } from '@dis/services/message/custom-dialog.service';

@Injectable({
  providedIn: 'root'
})

// need to look into making Set URL Dialog

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnInit {
  newIPaddress:string;
  newPort:number;

  noCapitalUsername:string;

  onlineSelected:boolean = true;
  offlineSelected:boolean = false;

  setUrlDialogOpen:boolean = false;
  downloadDataPageOpen:boolean = false;

  loginFailed:boolean = false;

  constructor(private router: Router, private customDialog: CustomDialogService) { }

  ngOnInit(): void {}

  public loginForm: FormGroup = new FormGroup({
    username: new FormControl(),
    password: new FormControl()
  });

  public IpAddressForm: FormGroup = new FormGroup({
    ipAddress: new FormControl(),
    port: new FormControl()
  });

  loginAuthentication(username:string, pw:string) {
    this.noCapitalUsername = username.toLocaleLowerCase();
    if ((this.noCapitalUsername.localeCompare(tempUsername) == 0) && (pw.localeCompare(tempPassword) == 0)) {
      this.loginFailed = false;
      this.router.navigate(['/mainmenunew']);
    } else {
      this.loginFailed = true;
    }
  }

  // switches between online mode and offline mode
  switchMode(chosenMode:string) {
    if (chosenMode.localeCompare('online') == 0) {
      this.onlineSelected = true;
      this.offlineSelected = false;
    } else {
      this.offlineSelected = true;
      this.onlineSelected = false;
    }
  }

  // show dialog for set URL button
  setUrl() {
    this.setUrlDialogOpen = true;
  }

  closeSetUrl() {
    this.setUrlDialogOpen = false;
  }

  saveUrl() {
    // should save the data in the textfields first
    this.newIPaddress = this.IpAddressForm.value["ipAddress"];
    this.newPort = this.IpAddressForm.value["port"];
    // after this, need code to officially set URL
    this.setUrlDialogOpen = false;
  }

  openDownloadDataPage() {
    this.router.navigateByUrl('/downloaddata');
  }

  forgotPassword() {
    this.customDialog.message('ALERT', 'Please contact Administrator for login details.',
      [{text: 'Close', primary: true}], 'warning').subscribe();
  }
}
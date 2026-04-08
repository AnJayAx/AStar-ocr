import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
// import { AuthService } from '@dis/services/auth/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: []
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  @ViewChild('password') password: TextBoxComponent;
  error: string;

  constructor(private _router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', Validators.email),
      password: new FormControl()
    });
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.password.input.nativeElement.type = 'password';
  }

  toggleVisibility(): void {
    const inputEl = this.password.input.nativeElement;
    inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
  }

  // login(): void {
  //   this.form.markAllAsTouched();
  //   if (this.form.valid) {
  //     this._authService
  //       .login(this.form.value.email, this.form.value.password)
  //       .pipe(first())
  //       .subscribe(
  //         result => {
  //           this._router.navigate(['sample']);
  //           this.error = '';
  //         },
  //         err => (this.error = 'Could not authenticate.')
  //       );
  //   }
  // }

  // isLoggedIn() {
  //   return this._authService.isLoggedIn();
  // }
}
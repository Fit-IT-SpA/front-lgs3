import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../shared/services/firebase/auth.service';
import { AuthServiceNielsen } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { validate, clean, format } from 'rut.js';
import { I18nService } from '../../shared/services/i18n.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AccountService } from '../../shared/services/account.service';
import * as firebase from 'firebase/app';

/*export interface User {
  uid: string;
  token?: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}*/

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [AccountService]
})
export class ForgotPasswordComponent implements OnInit {

  public show: boolean = false;
  public recoverForm: FormGroup;
  //public errorMessage: any;
  //public userData: any;
  //public user: firebase.User;
  public showLoader: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
      public authService: AuthService,
      public afs: AngularFirestore,
      public _authSrv: AuthServiceNielsen,
      private fb: FormBuilder, 
      private _router: Router,
      private _accountSrv: AccountService,
      public _i18n : I18nService,
      public toster: ToastrService) {
      this.recoverForm = this.fb.group({
        email: ['', [Validators.required]]
      });
  }

  ngOnInit() {
  }

  showPassword() {
    this.show = !this.show;
  }

    
  forgetPassword(){
    if (this.recoverForm.valid){
      this.showLoader = true;
      this.subscription.add(this._accountSrv.forgotPassword(this.recoverForm.controls.email.value).subscribe(
        response => {
            //this.snack.open(this._i18n.getKeyWithParameters('sign-in.forgot_request', { email : response.email}), 'X', { panelClass: ['success'], verticalPosition: 'top', duration: ConstantService.snackDuration });
            setTimeout (() => {
              this._router.navigate(['/sign-in']);
            }, 4000);
        },
        error =>    {
            //this.snack.open(this._i18n.getKey(error.error.error.message), 'X', { panelClass: ['default'], verticalPosition: 'top', duration: ConstantService.snackDuration });
            this.showLoader = false;
        },
      ));
    }
  }

}

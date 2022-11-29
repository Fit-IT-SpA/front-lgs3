import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../shared/services/firebase/auth.service';
import { AuthServiceNielsen } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { validate, clean, format } from 'rut.js';
import { I18nService } from '../../shared/services/i18n.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { AccountService } from 'src/app/shared/services/account.service';
import { matchingPasswords } from 'src/app/shared/validators/form-validators';

@Component({
  selector: 'app-activate-password',
  templateUrl: './activate-password.component.html',
  styleUrls: ['./activate-password.component.scss'],
  providers: [AccountService]
})
export class ActivatePasswordComponent implements OnInit {

  public show: boolean = false;
  public registerForm: FormGroup;
  user: string;
  token: string;
  tips = {
    password: "",
    confirmPassword: ""
  }
  i18nTips = {
    password: [], confirmPassword: []
  };
  public showLoader: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
      public authService: AuthService,
      public afs: AngularFirestore,
      public _authSrv: AuthServiceNielsen,
      private fb: FormBuilder, 
      private _router: Router,
      public _i18n : I18nService,
      private accountSrv : AccountService,
      private activatedRoute: ActivatedRoute,
      public toster: ToastrService) {
        this.registerForm = this.fb.group({
          password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
          confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]]
        });
  }

  ngOnInit() {
    this.subscription.add(this.activatedRoute.params.subscribe(
      params => {
        this.token = params['hash'];
        if (this.token && this.token != ''){
          setTimeout (() => {
            this.checkHash();
          }, 200);
        }
      }
    ));
  }
  private checkHash(){
    this.subscription.add(this.accountSrv.validateHashForgotPassword(this.token).subscribe(
      response => {
        this.user = response.user;
        this.constructorChangePassword();
        
      },
      err =>    {
        //this.snack.open(this._i18n.getKey(err.error.error.message), "X", { panelClass: ['default'], verticalPosition: 'top', duration: ConstantService.snackDuration });
        setTimeout (() => {
          this._router.navigate(['/auth/login']);
        }, 4000);
      },
    ));
  }
  private constructorChangePassword(){
    
    this.i18nTips = {
      password : [
        this._i18n.getKey("tips.remember"),
        this._i18n.getKey('tips.blank'),
        this._i18n.getKey("tips.repass1"),
        this._i18n.getKey("tips.repass2"),
        this._i18n.getKey("tips.repass3")
      ],
      confirmPassword : [
        this._i18n.getKey("tips.confirmPassword")
      ]
    }

    this.tips.password = this.i18nTips.password.join("\r\n");
    this.tips.confirmPassword = this.i18nTips.confirmPassword.join("\r\n");
  }
  setPassword(){
    this.showLoader = true;
    if (this.registerForm.valid){
      this.subscription.add(this.accountSrv.updatePassword(this.user, this.registerForm.controls.confirmPassword.value, this.token).subscribe(
        response => {
          //this.snack.open(this.i18n.getKey('sign-in.pass_changed'), "X", { panelClass: ['success'], verticalPosition: 'top', duration: ConstantService.snackDuration });
          this.toster.success('Su contraseña se actualizo con éxito!!');
          setTimeout (() => {
            this._router.navigate(['/auth/login']);
          }, 4000);
        },
        error =>    {
          //this.snack.open(this.i18n.getKey(response.error.error.message), "X", { panelClass: ['default'], verticalPosition: 'top', duration: ConstantService.snackDuration });
          this.toster.error(error.error.error.message);
          this.showLoader = false;
        },
      ));
    }
  }

}

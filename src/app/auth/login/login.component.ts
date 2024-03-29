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
import * as firebase from 'firebase/app';
import { Session } from 'src/app/shared/model/session';

export interface User {
  uid: string;
  token?: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public show: boolean = false;
  public loginForm: FormGroup;
  public errorMessage: any;
  public userData: any;
  public user: firebase.User;
  public showLoader: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
      public authService: AuthService,
      public afs: AngularFirestore,
      public _authSrv: AuthServiceNielsen,
      private fb: FormBuilder, 
      private _router: Router,
      public _i18n : I18nService,
      public toster: ToastrService) {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]]
      });
  }

  ngOnInit() {
  }

  showPassword() {
    this.show = !this.show;
  }
  
  // Login With Google
  loginGoogle() {
    this.authService.GoogleAuth();
  }

  // Login With Twitter
  loginTwitter(): void {
    this.authService.signInTwitter();
  }

  // Login With Facebook
  loginFacebook() {
    this.authService.signInFacebok();
  }

  // Simple Login
  login() {
    //this.authService.SignIn(this.loginForm.value['email'], this.loginForm.value['password']);
    
    
    
  }
  
  onFocusRut(){
        this.loginForm.controls.email.markAsPristine();
        if (this.loginForm.controls.email.value != ''){
            this.loginForm.controls.email.setValue(clean(this.loginForm.controls.email.value));
        }
    }

    
    onBlurRut() {
        if (this.loginForm.controls.email.value != '') {
            if (this.loginForm.controls.email.value.length > 3 && validate(this.loginForm.controls.email.value)) {
            this.loginForm.controls.email.setErrors(null);
            this.loginForm.controls.email.setValue(format(this.loginForm.controls.email.value));
            
            } else {
            this.loginForm.controls.email.setErrors({'incorrect': true});
            }
            this.loginForm.controls.email.markAsDirty();
        }
    }
    
    doLogin(){
        //this.loadingSrv = true;
        //this.message = null;
        this.loginForm.disable();
        let credentials = {
            email : (this.loginForm.controls.email.value) ? this.loginForm.controls.email.value.toLowerCase() : '',
            password: this.loginForm.controls.password.value
        }
        this.subscription.add(this._authSrv.signIn(credentials).subscribe(
            response => {
                let profile: Session = JSON.parse(localStorage.getItem('profile'));
                if (profile.role.slug === 'taller') {
                  this._router.navigate(['/admin/orders']);
                } else if (profile.role.slug === 'comercio') {
                  this._router.navigate(['/admin/orders/offers']);
                } else {
                  this._router.navigate(['/admin/users/sales-management']);
                }
                
            },
            response =>    { 
                this.loginForm.enable();
                //this.loadingSrv = false;
                let error = response.error.error.message.toString().split("|");
                if (error.length == 0){
                    this.toster.error(this._i18n.getKey(response.error.error.message));
                } else {
                    this.toster.error(this._i18n.getKeyWithParameters(error[0], { attempts: error[1]}));
                }
            })
        );
    }
    
    // Set user
  SetUserData(user) {
      //console.log(user);
    const userRef:  AngularFirestoreDocument<any> =  this.afs.doc(`users/${user.token}`);
    //console.log(userRef);
    const userData: User = {
      email: user.email,
      displayName: user.name,
      uid: user.token,
      photoURL: user.photoURL || 'assets/dashboeard/boy-2.png',
      emailVerified: user.email
    };
    userRef.delete().then(function () {})
          .catch(function (error) {});
    return userRef.set(userData, {
      merge: true
    });
  }

}

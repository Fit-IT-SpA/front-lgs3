import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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

/*export interface User {
  uid: string;
  token?: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}*/

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  public show: boolean = false;
  public loginForm: FormGroup;
  //public errorMessage: any;
  //public userData: any;
  //public user: firebase.User;
  public showLoader: boolean = false;
  public billingTypes: {title: string, slug: string, check: boolean}[] = [];
  public loading: boolean = true;
  public placeholderRut: string = '';

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
        name: ['', [Validators.required,Validators.maxLength(35)]],
        lastName: ['', [Validators.required,Validators.maxLength(70)]],
        typeUser: ['', [Validators.required]],
        rut: ['', [Validators.required]],
        billingType: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]]
      });
      this.loginForm.get('rut').disable();
      this.loginForm.get('billingType').disable();
  }

  ngOnInit() {
    this.getBilling();
  }
  getBilling() {
    this.billingTypes.push({title: 'Factura', slug: 'factura', check: false});
    this.billingTypes.push({title: 'Boleta', slug: 'boleta', check: false});
    this.loading = false;
  }

  showPassword() {
    this.show = !this.show;
    //console.log(this.loginForm.controls.confirmPassword.value);
    //console.log(this.loginForm.controls.password.value)
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
  
  onFocusRut() {
    this.loginForm.controls.rut.markAsPristine();
    if (this.loginForm.controls.rut.value != "") {
      this.loginForm.controls.rut.setValue(
        clean(this.loginForm.controls.rut.value)
      );
    }
  }

  onBlurRut() {
    if (this.loginForm.controls.rut.value != "") {
      if (
        this.loginForm.controls.rut.value.length > 3 &&
        validate(this.loginForm.controls.rut.value)
      ) {
        this.loginForm.controls.rut.setErrors(null);
        this.loginForm.controls.rut.setValue(
          format(this.loginForm.controls.rut.value)
        );
      } else {
        this.loginForm.controls.rut.setErrors({ rut: true });
      }
      this.loginForm.controls.rut.markAsDirty();
    }
  }
    doLogin(){
        //this.loadingSrv = true;
        //this.message = null;
        //this.loginForm.disable();
        let credentials: { email: string, name: string, lastName: string, typeUser: string, password: string, billingType: string, rut: string } = {
            email : (this.loginForm.controls.email.value) ? this.loginForm.controls.email.value.toLowerCase() : '',
            name : this.loginForm.controls.name.value,
            lastName : this.loginForm.controls.lastName.value,
            typeUser: this.loginForm.controls.typeUser.value,
            password: this.loginForm.controls.confirmPassword.value,
            billingType: (this.loginForm.controls.billingType.value) ? this.loginForm.controls.billingType.value : '', 
            rut: (this.loginForm.controls.rut.value) ? clean(this.loginForm.controls.rut.value) : ''
        }
        //console.log(credentials);
        this.subscription.add(this._authSrv.register(credentials).subscribe(
            response => {
                this._router.navigate(['/auth/login']);
                this.toster.success('Se creó su cuenta con exito!!');
            },
            error => {
              this.toster.error(error.error.error.message);
            })
        );
    }
    chooseTypeUser() {
      console.log(this.loginForm.controls.typeUser.value);
      if (this.loginForm.controls.typeUser.value === "taller") {
        this.loginForm.get('rut').enable();
        this.loginForm.get('billingType').enable();
      } else {
        this.loginForm.get('rut').disable();
        this.loginForm.get('billingType').disable();
        this.placeholderRut = '';
      }
    }
    public clickBilling(slug: string) {
      this.loginForm.controls.billingType.setValue(slug);
      if (slug === 'boleta') {
        this.placeholderRut = 'Ingrese su rut';
      } else {
        this.placeholderRut = 'Ingrese rut de su empresa';
      }
    }

}

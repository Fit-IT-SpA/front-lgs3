import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription} from 'rxjs';
import { UtilService } from './../../../../../shared/services/util.service';
import { I18nService } from '../../../../../shared/services/i18n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validate, clean, format } from 'rut.js';
import { UserService } from '../user.service';
import { User } from '../../../../../shared/model/user';
import { Role } from '../../../../../shared/model/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Country } from '../../../../../shared/model/country';
import { Group } from '../../../../../shared/model/group';
import { Customer } from '../../../../../shared/model/costumer';
import { CountryService } from '../../../../../shared/services/country.service';
import { RoleService } from '../../role/role.service';
import { emailValidator, justLetterValidatorLastAndFirstName,
  selectAnOptionValidator, mobileValidator} from '../../../../../shared/validators/form-validators';
import { MatStepper } from '@angular/material/stepper';
import { ConstantService } from '../../../../../shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';
import { UserAdd } from '../../../../../shared/model/user-add';
import { AuthServiceNielsen } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss'],
  providers: [ UserService, CountryService, RoleService, AuthServiceNielsen],
})
export class UserAddComponent implements OnInit, OnDestroy {
  private subscription :Subscription = new Subscription();
  screenType: string;
  countries: Country[] = [];
  roles: Role[] = [];
  formAdd: FormGroup;
  originalUser: any;
  updateUser:any;
  user: User = null;
  userAdd: User = null;
  loading : boolean = true;
  loadingSrv : boolean = false;
  charges:Customer[];
  groups:Group[];
  access: boolean = false;
  maxDate: Date;
  public rolesFilter: { value: string, label: string, job: string }[] = [];
  //public countriesFilter: { value: string, label: string, job: string }[] = [];
  public show: boolean = false;

  @ViewChild('stepper') private myStepper: MatStepper;

  constructor(private utilSrv : UtilService, private roleSrv : RoleService, private router : Router, 
    public i18n : I18nService, private countrySrv : CountryService, private srv : UserService, private authSrv: AuthServiceNielsen,
    private snack : MatSnackBar, public formBuilder: FormBuilder, public toster: ToastrService) {
      const now = new Date();
      this.maxDate = new Date(now.getFullYear()-18, now.getMonth(), now.getDate());
  }

  private haveAccess(){
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter( (perm: string) => {
        return perm === ConstantService.PERM_USUARIO_ADMIN_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit() {
    let access = this.haveAccess();
    if (!access){
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.initForms();
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => { 
          this.screenType = screen;
        }
      ));
      this.getRoles();
    }
  }

  /*private getCountries(){
    this.subscription.add(this.countrySrv.findAll()
      .subscribe(
        response => {
          this.countries = response;
          for (let country of this.countries) {
            this.countriesFilter.push({
              value: country.code,
              label: country.name,
              job: ''
            });
          }
          this.getRoles();
        },
        error => {
          this.loading = false;
          this.snack.open('Se ha producido un error al intentar conseguir los países.', 'X',
            { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      )
    );
  }*/

  private getRoles(){
    this.subscription.add(this.roleSrv.findAllActive()
      .subscribe(
        response => {
          this.roles = response;
          for (let role of this.roles) {
            this.rolesFilter.push({
              value: role.slug,
              label: role.title,
              job: ''
            });
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir los roles.');
        }
      )
    );
  }

  initForms(){
    this.formAdd = this.formBuilder.group({
        //rut   : ['', [ Validators.required]],
        name : ['', [ Validators.required, Validators.minLength(3),Validators.maxLength(40)/*, justLetterValidatorLastAndFirstName*/]],
        lastName: ['', [ Validators.required, Validators.minLength(3),Validators.maxLength(40)/*, justLetterValidatorLastAndFirstName*/]],
        secondLastName: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(40)/*, justLetterValidatorLastAndFirstName*/]],
        email: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(40), emailValidator]],
        //phone: ['', [ Validators.minLength(9),Validators.maxLength(9), mobileValidator ]],
        //nationality: [ { value: 'CL', label: "Chile", job: "" }, [Validators.required, selectAnOptionValidator ]],
        role : [ null, [ Validators.required, selectAnOptionValidator]],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]]
    });
  }

  onFocusRut(){
    this.formAdd.controls.rut.markAsPristine();
    if (this.formAdd.controls.rut.value != ''){
      this.formAdd.controls.rut.setValue(clean(this.formAdd.controls.rut.value));
    }
  }

  
  onBlurRut() {
    if (this.formAdd.controls.rut.value != '') {
      if (this.formAdd.controls.rut.value.length > 3 && validate(this.formAdd.controls.rut.value)) {
        this.formAdd.controls.rut.setErrors(null);
        this.formAdd.controls.rut.setValue(format(this.formAdd.controls.rut.value));
        
      } else {
        this.formAdd.controls.rut.setErrors({'incorrect': true});
      }
      this.formAdd.controls.rut.markAsDirty();
    }
  }
  
  
  private save(){
    //console.log(this.createUser());
    this.subscription.add(this.authSrv.register(this.createUser()).subscribe(
      response => {
        this.userAdd = response;
        this.toster.success('Se ha agregado satisfactoriamente el usuario.');
        this.loadingSrv = false;
        this.loading = false;
        this.goBack();
      }, error => {
        this.loadingSrv = false;
        this.toster.error('Se ha producido un error al intentar guardar el usuario.');
      }
    ));
  }

  add(){
    this.loading = false;
    this.loadingSrv = true;
    this.validateEmail();
  }

  private validateEmail(){
    this.subscription.add(this.srv.findByEmail(this.formAdd.controls.email.value).subscribe(
      response => {
        if (response.length === 0){
          this.save();
        } else {
          this.loadingSrv = false;
          this.toster.info('Ya existe un usuario registrado con ese email');
        }
      }, error => {
        this.loadingSrv = false;
        this.toster.error('Ya existe un usuario registrado con ese email');
      }
    ));
  }

  /*private validateRut(){
    this.subscription.add(this.srv.findByRut(clean(this.formAdd.controls.rut.value)).subscribe(
      response => {
        if (response.length === 0){
          this.validateEmail();
        } else {
          this.loading = false;
          this.toster.info('Ya existe un usuario registrado con ese rut');
        }
      }, error => {
        this.loading = false;
        this.loadingSrv = false;
        this.toster.error('Ya existe un usuario registrado con ese rut');
      }
    ));
  }*/


  private createUser(){
    let user: UserAdd = {
      email: this.formAdd.controls.email.value,
      name: this.formAdd.controls.name.value,
      lastName: this.formAdd.controls.lastName.value+' '+this.formAdd.controls.secondLastName.value,
      //rut: clean(this.formAdd.controls.rut.value),
      //nationality: (this.formAdd.controls.nationality.value) ? this.formAdd.controls.nationality.value.value : '',
      //phone: this.formAdd.controls.phone.value,
      typeUser: (this.formAdd.controls.role.value) ? this.formAdd.controls.role.value.value : "",
      password: this.formAdd.controls.confirmPassword.value
    }
    return user;
  }
  showPassword() {
    this.show = !this.show;
    console.log(this.formAdd.controls.confirmPassword.value);
    console.log(this.formAdd.controls.password.value)
  }

  goBack(){
    this.router.navigate(['/admin/users/user']);
  }
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
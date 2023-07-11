import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from './../../../../../shared/services/util.service';
import { I18nService } from '../../../../../shared/services/i18n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validate, clean, format } from 'rut.js';
import { UserService } from '../user.service';
import { User } from '../../../../../shared/model/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Country } from '../../../../../shared/model/country';
import { Role } from '../../../../../shared/model/role.model';
import { CountryService } from '../../../../../shared/services/country.service';
import { RoleService } from '../../role/role.service';
import { emailValidator, justLetterValidatorLastAndFirstName,
    selectAnOptionValidator, mobileValidator} from '../../../../../shared/validators/form-validators';
    import { ConstantService } from '../../../../../shared/services/constant.service';
import { SessionService } from '../../../../../shared/services/session.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [ UserService, CountryService, RoleService]
})
export class UserEditComponent implements OnInit, OnDestroy {
    private subscription :Subscription = new Subscription();
    screenType: string;
    countries: Country[] = [];
    code: string;
    roles: Role[] = [];
    user: User = null;
    loading : boolean = true;
    formEdit: FormGroup;
    access: boolean = false;
    maxDate: Date;
    public rolesFilter: { value: string, label: string, job: string }[] = [];
    //public countriesFilter: { value: string, label: string, job: string }[] = [];

    constructor(private activatedRoute: ActivatedRoute, private utilSrv : UtilService, private roleSrv : RoleService,
      private router : Router, public i18n : I18nService, private countrySrv : CountryService, public toster: ToastrService,
      private srv : UserService, private snack : MatSnackBar, public formBuilder: FormBuilder, private session : SessionService) {
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
        this.subscription.add(this.utilSrv.screenType$.subscribe(
          screen => { 
            this.screenType = screen;
          }
        ));
        
        this.subscription.add(this.activatedRoute.params.subscribe(params => { 
          this.code = params['id'];
          
          this.getRoles();
        }));
      }
    }
  
    private getUser(){
      this.subscription.add(this.srv.findById(this.code).subscribe(
        response => {
          this.user = response;
          console.log(this.user);
          this.formEdit = this.formBuilder.group({
            //rut   : [format(response.rut), [ Validators.required]],
            name : [response.name, [ Validators.required, Validators.minLength(3),Validators.maxLength(40), justLetterValidatorLastAndFirstName]],
            lastName: [response.lastName, [ Validators.required, Validators.minLength(3),Validators.maxLength(40), justLetterValidatorLastAndFirstName]],
            secondLastName: [response.secondLastName, [Validators.required, Validators.minLength(3),Validators.maxLength(40), justLetterValidatorLastAndFirstName]],
            email: [response.email, [ Validators.required, Validators.minLength(10), Validators.maxLength(40), emailValidator]],
            //email: this.formBuilder.control({value: response.email, disabled: true}),
            //phone: [response.phone, [ Validators.minLength(9),Validators.maxLength(9), mobileValidator ]],
            //nationality: this.formBuilder.control({value: this.searchNationality(response.nationality), disabled: false}), 
            role: this.formBuilder.control({value: this.searchRole(response.role), disabled: false}), 
          });
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir el usuario.');
        }
      ));
    }
    private searchNationality(id: string): { value: string, label: string, job: string } | null {
        for (let country of this.countries) {
            if (country.code === id) {
              return {value: country.code, label: country.name, job: ""};
            }
        }
        return null;
    }
    private searchRole(id: string): { value: string, label: string, job: string } | null {
        for (let role of this.roles) {
            if (role.slug === id) {
              return {value: role.slug, label: role.title, job: ""};
            }
        }
        return null;
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
            this.toster.error('Se ha producido un error al intentar conseguir los países.');
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
            this.getUser();
          },
          error => {
            this.toster.error('Se ha producido un error al intentar conseguir los roles.');
          }
        )
      );
    }

    onFocusRut(){
      this.formEdit.controls.rut.markAsPristine();
      if (this.formEdit.controls.rut.value != ''){
        this.formEdit.controls.rut.setValue(clean(this.formEdit.controls.rut.value));
      }
    }
  
    
    onBlurRut() {
      if (this.formEdit.controls.rut.value != '') {
        if (this.formEdit.controls.rut.value.length > 3 && validate(this.formEdit.controls.rut.value)) {
          this.formEdit.controls.rut.setErrors(null);
          this.formEdit.controls.rut.setValue(format(this.formEdit.controls.rut.value));
          
        } else {
          this.formEdit.controls.rut.setErrors({'incorrect': true});
        }
        this.formEdit.controls.rut.markAsDirty();
      }
    }
    
    private save(){
      this.subscription.add(this.srv.update(this.formEdit.controls.email.value, this.updatedFinalUser()).subscribe(
        response => {
          //this.getCurrentUser();
          this.loading = false;
          this.toster.success('Se ha editado satisfactoriamente el usuario.');
          this.goBack();
        }, error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar editar el usuario.');
        }
      ));
    }

    /*private getCurrentUser(){
      this.subscription.add(this.srv.getCurrentUser().subscribe(
        response => {
          this.loading = false;
          this.session.setUpdateProfile(response);
          this.snack.open('Se ha editado satisfactoriamente el usuario.', 'X',
              { panelClass: ['success'], verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }, error => {
          this.loading = false;
          this.snack.open('Se ha producido un error al intentar editar el usuario.', 'X',
              { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      ));
    }*/

    private updatedFinalUser(){
      let user: any = {
        email: this.formEdit.controls.email.value,
        name: this.formEdit.controls.name.value,
        lastName: this.formEdit.controls.lastName.value,
        secondLastName: this.formEdit.controls.secondLastName.value,
        //rut: clean(this.formEdit.controls.rut.value),
        //nationality: (this.formEdit.controls.nationality.value) ? this.formEdit.controls.nationality.value.value : '',
        //phone: this.formEdit.controls.phone.value,
        role: (this.formEdit.controls.role.value) ? this.formEdit.controls.role.value.value : "",
      }
      return user;
    }
  
    add(){
      this.loading = true;
      this.validateEmail();
    }
  
    private validateEmail(){
      this.subscription.add(this.srv.findByEmail(this.formEdit.controls.email.value).subscribe(
        response => {
          if (response.length === 0 || (response.length === 1 && this.formEdit.controls.email.value === this.user.email)){
            this.save();
          } else {
            this.loading = false;
            this.toster.info('Ya existe un usuario registrado con ese email');
          }
        }, error => {
          this.loading = false;
          this.toster.error('Ya existe un usuario registrado con ese email');
        }
      ));
    }
  
    /*private validateRut(){
      this.subscription.add(this.srv.findByRut(clean(this.formEdit.controls.rut.value)).subscribe(
        response => {
          if (response.length === 0 || (response.length === 1 && clean(this.formEdit.controls.rut.value) === this.user.rut)){
            this.validateEmail();
          } else {
            this.loading = false;
            this.toster.info('Ya existe un usuario registrado con ese rut');
          }
        }, error => {
          this.loading = false;
          this.toster.error('Ya existe un usuario registrado con ese rut');
        }
      ));
    }*/
  
    goBack(){
      this.router.navigate(['/admin/users/user']);
    }
  
    ngOnDestroy() {
      if (this.subscription) this.subscription.unsubscribe();
    }

  }
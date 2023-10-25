import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/model/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { validate, clean, format } from 'rut.js';
import { ConstantService } from 'src/app/shared/services/constant.service'; 
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Role } from 'src/app/shared/model/role.model';
import { Department } from 'src/app/shared/model/department';
import { RoleService } from '../role/role.service';
import 'moment/locale/es';
import { UtilService } from 'src/app/shared/services/util.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [UserService, RoleService]
})
export class UserComponent implements OnInit, OnDestroy {
  loading : boolean = true;
  loadingSrv : boolean = true;
  private subscription: Subscription = new Subscription();
  users: User[] = null;
  currentPage:number=0;
  pageSize:number= ConstantService.paginationDesktop;
  totalElements:number;
  searchInputControl: FormControl;
  filterForm: FormGroup;
  departments : Department[];
  private roles: Role[] = [];
  public rolesFilter: { value: string, label: string, job: string }[] = [];
  debounceTime:number = 200;
  recentlySearch:boolean=false;
  parameters = {
    email : "",
    rut: '',
    fullname: '',
    role: '',
    phone: '',
	status: ''
  }
  screenType: string;
  advancedFilter:boolean = false;
  access: boolean = false;
  constructor(public formBuilder: FormBuilder, private roleSrv : RoleService,
    private srv : UserService, private snack : MatSnackBar, private router : Router, 
	private utilSrv : UtilService) {
      this.screenType = utilSrv.getScreenSize();
  }

  private haveAccess(){
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter( (perm: string) => {
        return perm === ConstantService.PERM_USUARIO_ADMIN_LECTURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit(): void {

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
      this.filterForm = this.formBuilder.group({
        role   : [null],
        fullname : [''],
        rut: [''],
        status: [''],
        email: [''],
        phone: [''],
      });

      this.getRoles();
    }
  }

  private getRoles(){
    this.subscription.add(this.roleSrv.findAllActive()
      .subscribe(
        response => {
          this.roles = response;
		  this.rolesFilter.push({
            value: "",
            label: "Todos los Tipos",
            job: ''
          });
		  for (let role of this.roles) {
            this.rolesFilter.push({
              value: role.slug,
              label: role.title,
              job: ''
            });
          }
		  console.log(this.rolesFilter);
          this.getCount();
        },
        error => {
          this.loading = false;
          this.snack.open('Se ha producido un error al intentar conseguir los roles.', 'X',
            { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      )
    );
  }

  private getCount(){
    this.subscription.add(this.srv.countWithParams(this.parameters)
      .subscribe(
        response => {
          this.totalElements = response;
          this.find();
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los usuarios.', 'X',
            { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      )
    );
  }

  private find() {
    this.subscription.add(this.srv.findWithParams(this.parameters, this.currentPage)
      .subscribe(
        response => {
          this.users = response;
		  console.log(this.users);
          this.loading = false;
          this.loadingSrv = false;
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los usuarios.', 'X',
            { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      )
    );
  }

  add(){
    this.router.navigate(['/admin/users/user/add']);
  }

  edit(email : string){
    this.router.navigate(['/admin/users/user/edit/' + email ]);
  }

  private async remove(rut : string){
	if(this.canWrite() == false) {
		return;
	}
    this.subscription.add(this.srv.changeStatus(rut, -1)
      .subscribe(
        response => {
          return true;
        },
        err => {
          console.log(err);
		  return false;
        }   
      )
    );
	return false;
  }
  removeWithConfirmation(id: string, name: string) {
    Swal.fire({
      title: '¿Estás seguro que deseas eliminar a '+name+'?',
      text: "No podras revertir esto despues!",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!'
    }).then((result) => {
      if (result.value) {
        let confirm = this.remove(id);
        console.log(confirm);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                name+' ha sido eliminado.',
                'success'
            )
            this.loading = true;
            this.getCount();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                name+' no se pudo eliminar.',
                'error'
            )
        }
        
      }
    })
  }

  onPageFired(event : any){
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getCount();
  }

  formatRut(rut : string){
    return format(rut);
  }

  onFocusRut(){
    this.filterForm.controls.rut.markAsPristine();
    if (this.filterForm.controls.rut.value != ''){
      this.filterForm.controls.rut.setValue(clean(this.filterForm.controls.rut.value));
    }
  }

  
  onBlurRut() {
    if (this.filterForm.controls.rut.value != '') {
      if (this.filterForm.controls.rut.value.length > 7 && validate(this.filterForm.controls.rut.value) || this.filterForm.controls.rut.value.length == 8) {
        this.filterForm.controls.rut.setErrors(null);
      } else {
        this.filterForm.controls.rut.setErrors({'incorrect': true});
      }
      this.filterForm.controls.rut.markAsDirty();
    } else if (this.recentlySearch) {
      this.parameters.rut = "";
      this.getCount();
    }
  }

  changeFilter(){
    this.loadingSrv = true;
	this.loading = true;
    this.parameters.rut = clean(this.filterForm.controls.rut.value);
    this.parameters.fullname = this.filterForm.controls.fullname.value;
    this.parameters.role = (this.filterForm.controls.role.value) ? this.filterForm.controls.role.value.value : "";
    this.parameters.email = this.filterForm.controls.email.value;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.phone = this.filterForm.controls.phone.value;
	console.log(this.parameters);
    this.getCount();
  }

  canWrite(){
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

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}

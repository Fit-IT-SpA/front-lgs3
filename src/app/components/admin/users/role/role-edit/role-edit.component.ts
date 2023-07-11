import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription} from 'rxjs';
import { UtilService } from '../../../../../shared/services/util.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Role } from '../../../../../shared/model/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from '../role.service';
import { Privilege } from '../../../../../shared/model/privilege';
import { PrivilegeService } from '../../privilege/privilege.service';
import { ConstantService } from '../../../../../shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss'],
  providers: [ RoleService, PrivilegeService ]
})
export class RoleEditComponent implements OnInit, OnDestroy {
  private subscription :Subscription = new Subscription();
  slug : string;
  screenType: string;
  roleForm: FormGroup;
  privilegeForm: FormGroup;
  loading : boolean = true;
  role : Role;
  privileges: Privilege[] = [];
  privilagesFilter: { value: string, label: string, job: string }[] = [];
  status:number = 0;
  access: boolean = false;

  constructor(private utilSrv : UtilService, private roleSrv : RoleService,
    private activatedRoute: ActivatedRoute, private router : Router, private privilegeSrv : PrivilegeService,
    public toster: ToastrService, private snack : MatSnackBar, public formBuilder: FormBuilder) {
  }

  private haveAccess(){
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter( (perm: string) => {
        return perm === ConstantService.PERM_PERFIL_ADMIN_ESCRITURA;
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
      this.subscription.add(this.activatedRoute.params.subscribe(params => { 
        this.slug = params['slug'];
        this.getPrivileges();
      }));
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => { 
          this.screenType = screen;
        }
      ));
    }
  }

  private getPrivileges(){
    this.subscription.add(this.privilegeSrv.findAll().subscribe(
      response => {
        this.privileges = response;
        for (let privilage of this.privileges) {
          this.privilagesFilter.push({
            value: privilage.slug,
            label: privilage.title,
            job: ''
          })
        }
        this.getRole();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar conseguir los permisos.');
      }
    ));
  }

  private getRole(){
    this.subscription.add(this.roleSrv.findById(this.slug)
      .subscribe(
        response => {
          this.role = response;
          this.roleForm = this.formBuilder.group({
            title: this.formBuilder.control({value: response.title, disabled: false}),
            description: this.formBuilder.control({value: response.description, disabled: false}),
            status: this.formBuilder.control({value: response.status.toString(), disabled: false}),
            privileges: this.formBuilder.control({value: this.searchPrivilages(response.privilege), disabled: false}),
          });
          this.status = response.status;

          this.loading = false;
        },
        error => {
          this.toster.error('Se ha producido un error al intentar conseguir los roles.');
        }
      )
    );
  }
  private searchPrivilages(privilages: string[]) {
    var privilagesFilter: { value: string, label: string, job: string }[] = [];
    for (let privilage of privilages) {
      for (let privilageSystem of this.privilagesFilter) {
        if (privilage == privilageSystem.value) {
          privilagesFilter.push(privilageSystem);
        }
      }
    }
    return privilagesFilter;
  }

  private save(){
    this.subscription.add(this.roleSrv.update(this.slug, this.createRole()).subscribe(
      response => {
        this.loading = false;
        this.toster.success('Se ha editado satisfactoriamente el perfil.');
        this.goBack();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar editar el perfil.');
      }
    ));
  }

  add(){
    this.loading = true;
    this.subscription.add(this.roleSrv.findByName(this.roleForm.controls.title.value).subscribe(
      response => {
        if (response.length === 0 || (response.length === 1 && this.roleForm.controls.title.value === this.role.title)){
         this.save();
        } else {
          this.loading = false;
          this.toster.info('Ya existe un perfil con ese nombre');
        }
      }, error => {
        this.loading = false;
        this.toster.error('Ya existe un perfil con ese nombre');
      }
    ));
  }

  private createRole(){
    let role = {
      status: Number.parseInt(this.roleForm.controls.status.value),
      title: this.roleForm.controls.title.value,
      description: this.roleForm.controls.description.value,
      privilege: (this.roleForm.controls.privileges.value).map((object: { value: string; label: string; job: string }) => object.value)

    }
    return role;
  }
  onClickStatus(value: number) {
    this.roleForm.controls.status.setValue(value);
  }

  goBack(){
    this.router.navigate(['/admin/users/role']);
  }
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}

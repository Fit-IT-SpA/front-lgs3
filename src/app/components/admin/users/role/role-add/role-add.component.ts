import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from '../../../../../shared/services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from '../role.service';
import { PrivilegeService } from '../../privilege/privilege.service';
import { Privilege } from '../../../../../shared/model/privilege';
import { checkedOptionValidator } from '../../../../../shared/validators/form-validators';
import { ConstantService } from '../../../../../shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-add',
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.scss'],
  providers: [RoleService, PrivilegeService],
})
export class RoleAddComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  screenType: string;
  roleForm: FormGroup;
  loading: boolean = true;
  privileges: Privilege[] = [];
  privilagesFilter: { value: string, label: string, job: string }[] = [];
  access: boolean = false;
  constructor(private utilSrv: UtilService, private roleSrv: RoleService,
    private router: Router, private privilegeSrv: PrivilegeService,
    private snack: MatSnackBar, public formBuilder: FormBuilder, public toster: ToastrService) {}

  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_PERFIL_ADMIN_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit() {
    let access = this.haveAccess();
    if (!access) {
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.initForms();
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => {
          this.screenType = screen;
        }
      ));
    }
  }

  initForms() {

    this.roleForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(ConstantService.snackDuration)]],
      status: ['', [Validators.required, checkedOptionValidator]],
      privileges: ['', [Validators.required, checkedOptionValidator]]
    });

    this.getPrivileges();
  }

  private getPrivileges() {
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
        console.log(this.privilagesFilter);
        console.log(this.privileges);
        this.loading = false;
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar conseguir los permisos.')
      }
    ));
  }


  private save() {
    this.subscription.add(this.roleSrv.add(this.createRole()).subscribe(
      response => {
        this.loading = false;
        this.toster.success('Se ha agregado satisfactoriamente el perfil.');
        this.goBack();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar guardar el perfil.');
      }
    ));
  }

  add() {
    this.loading = true;
    this.subscription.add(this.roleSrv.findByName(this.roleForm.controls.title.value).subscribe(
      response => {
        if (response.length === 0) {
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

  private createRole() {
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

  goBack() {
    this.router.navigate(['/admin/users/role']);
  }
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}


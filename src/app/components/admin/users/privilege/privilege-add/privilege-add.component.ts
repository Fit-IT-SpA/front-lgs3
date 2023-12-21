import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from '../../../../../shared/services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '../../../../../shared/model/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrivilegeService } from '../privilege.service';
import { RoleService } from '../../role/role.service';
import { selectAnOptionValidator } from 'src/app/shared/validators/form-validators';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-privilege-add',
  templateUrl: './privilege-add.component.html',
  styleUrls: ['./privilege-add.component.scss'],
  providers: [PrivilegeService, RoleService]
})
export class PrivilegeAddComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  screenType: string;
  privilegeForm: FormGroup;
  loading: boolean = false;
  roles: Role[] = [];
  access: boolean = false;
  pageFilter: { value: string, label: string, job: string }[] = [
    { value: "Mis Comercios", label: "Mis Comercios", job: ""},
    { value: "Mis Talleres", label: "Mis Talleres", job: ""},
    { value: "Mis Pedidos", label: "Mis Pedidos", job: ""},
    { value: "Mis Ofertas", label: "Mis Ofertas", job: ""},
    { value: "Mis Ventas", label: "Mis Ventas", job: ""},
    { value: "Mis Compras", label: "Mis Compras", job: ""},
    { value: "Grupo Talleres", label: "Grupo Talleres", job: ""},
    { value: "Caja", label: "Caja", job: ""},
    { value: "Reportes", label: "Reportes", job: ""},
    { value: "Usuario Admin", label: "Usuario Admin", job: ""},
    { value: "Perfil Admin", label: "Perfil Admin", job: ""},
    { value: "Privilegio Admin", label: "Privilegio Admin", job: ""},
    { value: "Gestionar Negocios Admin", label: "Gestionar Negocios Admin", job: ""},
    { value: "Sistema", label: "Sistema", job: ""},
    { value: "Gestion de Ventas Admin", label: "Gestion de Ventas Admin", job: ""},
  ];
  modeFilter: { value: number, label: string, job: string }[] = [
    { value: 1, label: "Lectura", job: ""},
    { value: 2, label: "Escritura", job: ""}
  ]

  constructor(private utilSrv: UtilService, private privilegeSrv: PrivilegeService, public toster: ToastrService,
    private router: Router, private snack: MatSnackBar, public formBuilder: FormBuilder) {

  }

  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_PRIVILEGIO_ADMIN_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit(): void {
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

    this.privilegeForm = this.formBuilder.group({
      name: this.formBuilder.control({ value: '', disabled: true }),
      page: [null, [Validators.required, selectAnOptionValidator]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(ConstantService.snackDuration)]],
      mode: [null, [Validators.required, selectAnOptionValidator]]
    });
  }

  private save() {
    this.subscription.add(this.privilegeSrv.add(this.createPrivilege()).subscribe(
      response => {
        this.loading = false;
        this.toster.success('Se ha agregado satisfactoriamente el privilegio.');
        this.goBack();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar guardar el privilegio.');
      }
    ));
  }

  add() {
    this.loading = true;
    this.subscription.add(this.privilegeSrv.findByName(this.privilegeForm.controls.name.value).subscribe(
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

  setTitle() {
    let preffix = "";
    let suffix = "";
    if (this.privilegeForm.controls.mode.value !== null) {
      suffix = this.privilegeForm.controls.mode.value.value === 1 ? "Lectura" : "Escritura";
    }
    if (this.privilegeForm.controls.page.value !== null) {
      preffix = this.privilegeForm.controls.page.value.label
    }
    if (preffix !== "" && suffix !== "") {
      this.privilegeForm.controls.name.setValue(preffix + " " + suffix);
    } else {
      if (preffix !== "" && suffix === "") {
        this.privilegeForm.controls.name.setValue(preffix);
      } else {
        if (preffix === "" && suffix !== "") {
          this.privilegeForm.controls.name.setValue(suffix);
        }
      }
    }
  }

  private createPrivilege() {
    let privilege = {
      page: this.privilegeForm.controls.page.value.value,
      description: this.privilegeForm.controls.description.value,
      canWrite: this.privilegeForm.controls.mode.value.value === 2 ? true : false,
      canRead: this.privilegeForm.controls.mode.value.value === 1 ? true : false,
      title: this.privilegeForm.controls.name.value
    }
    return privilege;
  }

  checkWritePermission() {
    return this.privilegeForm.controls.page.value !== "Cargo" && this.privilegeForm.controls.page.value !== "Departamento"
      && this.privilegeForm.controls.page.value !== "Clientes" && this.privilegeForm.controls.page.value !== "Compañia"
      && this.privilegeForm.controls.page.value !== "Orden de Trabajo"
  }

  goBack() {
    this.router.navigate(['/admin/users/privilege']);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from 'src/app/shared/services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '../../../../../shared/model/role.model';
import { Privilege } from '../../../../../shared/model/privilege';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrivilegeService } from '../privilege.service';
import { selectAnOptionValidator } from 'src/app/shared/validators/form-validators';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-privilege-edit',
  templateUrl: './privilege-edit.component.html',
  styleUrls: ['./privilege-edit.component.scss'],
  providers: [PrivilegeService]
})
export class PrivilegeEditComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  screenType: string;
  privilegeForm: FormGroup;
  loading: boolean = true;
  roles: Role[] = [];
  slug: string;
  privilege: Privilege;
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
    { value: "Usuario Admin", label: "Usuario Admin", job: ""},
    { value: "Perfil Admin", label: "Perfil Admin", job: ""},
    { value: "Privilegio Admin", label: "Privilegio Admin", job: ""}
  ];
  modeFilter: { value: number, label: string, job: string }[] = [
    { value: 1, label: "Lectura", job: ""},
    { value: 2, label: "Escritura", job: ""}
  ]

  constructor(private utilSrv: UtilService, private privilegeSrv: PrivilegeService,
    private router: Router, private activatedRoute: ActivatedRoute, public toster: ToastrService,
    private snack: MatSnackBar, public formBuilder: FormBuilder) {
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

  ngOnInit() {
    let access = this.haveAccess();
    if (!access) {
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => {
          this.screenType = screen;
        }
      ));
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        this.slug = params['slug'];
        this.getPrivilege();
      }));
    }
  }


  private getPrivilege() {
    this.subscription.add(this.privilegeSrv.findById(this.slug)
      .subscribe(
        response => {
          this.privilege = response;
          this.privilegeForm = this.formBuilder.group({
            name: this.formBuilder.control({ value: '', disabled: true }),
            page: [this.findPage(response.page), [Validators.required, selectAnOptionValidator]],
            description: [response.description, [Validators.required, Validators.minLength(3), Validators.maxLength(ConstantService.snackDuration)]],
            mode: [response.canRead ? { value: 1, label: "Lectura", job: ""} : { value: 2, label: "Escritura", job: ""}, [Validators.required, selectAnOptionValidator]]
          });
          this.setTitle();
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir el privilegio.');
        }
      )
    );
  }
  private findPage(page: string) {
    for (let pageF of this.pageFilter) {
      if (pageF.value === page) {
        return pageF;
      }
    }
    return null;
  }

  private save() {
    this.subscription.add(this.privilegeSrv.update(this.slug, this.createPrivilege()).subscribe(
      response => {
        this.loading = false;
        this.toster.success('Se ha editado satisfactoriamente el privilegio.');
        this.goBack();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar editar el privilegio.');
      }
    ));
  }

  add() {
    this.loading = true;
    this.subscription.add(this.privilegeSrv.findByName(this.privilegeForm.controls.name.value).subscribe(
      response => {
        if (response.length === 0 || (response.length === 1 && this.privilegeForm.controls.name.value === this.privilege.title)) {
          this.save();
        } else {
          this.loading = false;
          this.toster.info('Ya existe un privilegio con ese nombre');
        }
      }, error => {
        this.loading = false;
        this.toster.error('Ya existe un privilegio con ese nombre');
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
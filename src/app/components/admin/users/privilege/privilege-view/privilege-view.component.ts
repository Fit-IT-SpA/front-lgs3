import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from 'src/app/shared/services/util.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrivilegeService } from '../privilege.service';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-privilege-view',
  templateUrl: './privilege-view.component.html',
  styleUrls: ['./privilege-view.component.scss'],
  providers: [PrivilegeService],
})

export class PrivilegeViewComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  slug: string;
  createdAt: string;
  createdBy: string;
  screenType: string;
  privilegeForm: FormGroup;
  loading: boolean = true;
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

  constructor(private utilSrv: UtilService, private roleSrv: PrivilegeService,
    private router: Router, private activatedRoute: ActivatedRoute, private snack: MatSnackBar, 
    public formBuilder: FormBuilder, public toster: ToastrService) {
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
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        this.slug = params['slug'];

        this.getPrivilege();
      }));
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => {
          this.screenType = screen;
        }
      ));
    }
  }

  private getPrivilege() {
    this.subscription.add(this.roleSrv.findById(this.slug)
      .subscribe(
        response => {
          this.privilegeForm = this.formBuilder.group({
            slug: this.formBuilder.control({ value: response.slug, disabled: true }),
            createdAt: this.formBuilder.control({ value: this.utilSrv.formatDate(response.createdAt), disabled: true }),
            createdBy: this.formBuilder.control({ value: response.createdBy, disabled: true }),
            name: this.formBuilder.control({ value: response.title, disabled: true }),
            description: this.formBuilder.control({ value: response.description, disabled: true }),
            page: this.formBuilder.control({ value: this.findPage(response.page), disabled: true }),
            mode: this.formBuilder.control({ value: response.canRead ? { value: 1, label: "Lectura", job: ""} : { value: 2, label: "Escritura", job: ""}, disabled: true }),
          });
          this.loading = false;
          this.createdAt = response.createdAt;
          this.createdBy = response.createdBy;
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

  goBack() {
    this.router.navigate(['/admin/users/privilege']);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}

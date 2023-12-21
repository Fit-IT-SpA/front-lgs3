import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from 'src/app/shared/services/util.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService } from '../../../companies/companies.service';
import { numberValidator, mobileValidator } from "../../../../../shared/validators/form-validators";
import { UserService } from '../../../users/user/user.service';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { validate, clean, format } from 'rut.js';
import { ToastrService } from 'ngx-toastr';
import { Companies } from 'src/app/shared/model/companies.model';
import { User } from 'src/app/shared/model/user';


@Component({
  selector: 'app-company-admin-view',
  templateUrl: './company-admin-view.component.html',
  styleUrls: ['./company-admin-view.component.scss'],
  providers: [CompaniesService, UserService],
})

export class CompanyAdminViewComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  public companyId: string;
  public company: Companies;
  public user: User;
  public formCompany: FormGroup;
  public formUser: FormGroup;
  public loading: boolean = true;
  public billingTypes: {title: string, slug: string, check: boolean}[] = [];
  public regionFilter: { value: string, label: string, job: string }[] = [];
  public communeFilter: { value: string, label: string, job: string }[] = [];
  public makesFilter: { value: string, label: string, job: string }[] = [];
  public banksFilter: { value: string, label: string, job: string }[] = [
    { value: "BANCO ESTADO", label: "BANCO ESTADO", job: "" },
    { value: "BANCO DE CHILE", label: "BANCO DE CHILE", job: "" },
    { value: "BANCO BCI", label: "BANCO BCI", job: "" },
    { value: "BANCO SANTANDER", label: "BANCO SANTANDER", job: "" },
    { value: "BANCO ITAÚ", label: "BANCO ITAÚ", job: "" },
    { value: "BANCO INTERNACIONAL", label: "BANCO INTERNACIONAL", job: "" },
    { value: "BANCO SCOTIABANK", label: "BANCO SCOTIABANK", job: "" },
    { value: "BANCO BICE", label: "BANCO BICE", job: "" },
    { value: "BANCO SECURITY", label: "BANCO SECURITY", job: "" },
    { value: "BANCO FALABELLA", label: "BANCO FALABELLA", job: "" },
    { value: "BANCO RIPLEY", label: "BANCO RIPLEY", job: "" },
    { value: "BANCO CONSORCIO", label: "BANCO CONSORCIO", job: "" },
    { value: "HSBC BANK", label: "HSBC BANK", job: "" },
    { value: "BANCO BTG PACTUAL", label: "BANCO BTG PACTUAL", job: "" }
  ]; 
  public accountTypesFilter: { value: string, label: string, job: string }[] = [
    { value: "Cuenta RUT", label: "Cuenta RUT", job: "" },
    { value: "Cta Corriente", label: "Cta Corriente", job: "" },
    { value: "Cta Vista", label: "Cta Vista", job: "" },
  ];
  public disabledCommuneFilter: boolean = false;
  public statusCompanyFilter: { value: number, label: string, job: string }[] = [
    {value: -1, label: "Eliminado", job: ""},
    {value: 0, label: "Pendiente Activación", job: ""},
    {value: 1, label: "Activo", job: ""},
    {value: 2, label: "Bloqueado", job: ""},
  ];
  public statusUserFilter: { value: number, label: string, job: string }[] = [
    {value: -1, label: "Eliminado", job: ""},
    {value: 0, label: "Pendiente Activación", job: ""},
    {value: 1, label: "Activo", job: ""},
    {value: 2, label: "Bloqueado", job: ""},
  ];


  constructor(private utilSrv: UtilService, private srv: CompaniesService, private userSrv: UserService,
    private router: Router, private activatedRoute: ActivatedRoute, private snack: MatSnackBar, 
    public fb: FormBuilder, public toster: ToastrService) {
  }

  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_NEGOCIOS_ADMIN_LECTURA;
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
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        this.companyId = params['id'];
        this.getCompany();
      }));
    }
  }
  private getCompany() {
    this.subscription.add(this.srv.findById(this.companyId).subscribe(
        response => {
            this.company = response;
            this.getUser();
        }, error => {
            console.log(error);
            this.loading = false;
            this.toster.error("Algo salio mal al buscar negocio");
        }
    ));
  }
  private getUser() {
    this.subscription.add(this.userSrv.findByEmail(this.company.createBy).subscribe(
        response => {
            console.log(response);
            if (response && response.length > 0) {
                this.user = response[0];
                this.formCompany = this.fb.group({
                    rut: [this.formatRut(this.company.rut), [Validators.required]],
                    billingType: [(this.user && this.user.role === 'taller') ? this.company.billingType : '', (this.user && this.user.role === 'taller') ? [Validators.required] : []],
                    name: [this.company.name, [Validators.required,Validators.maxLength(18)]],
                    direction: [this.company.direction, [Validators.required,Validators.maxLength(140)]],
                    region: [{ value: this.company.region, label: this.company.region, job: "" }, [Validators.required]],
                    commune: [{ value: this.company.commune, label: this.company.commune, job: "" }, [Validators.required]],
                    phone: [this.company.phone, [Validators.required,Validators.minLength(9),Validators.maxLength(9),mobileValidator,numberValidator]],
                    accountNumber: [this.company.accountNumber, (this.user && this.user.role === 'comercio') ? [Validators.required,numberValidator] : []],
                    accountType: [{ value: this.company.accountType, label: this.company.accountType, job: "" }, (this.user.role === 'comercio') ? [Validators.required] : []],
                    bank: [{ value: this.company.bank, label: this.company.bank, job: "" }, (this.user && this.user.role === 'comercio') ? [Validators.required] : []],
                    make: [this.makesFilter, (this.user && this.user.role === 'comercio') ? [Validators.required] : []],
                    status: [this.searchStatus(this.company.status, this.statusCompanyFilter), [Validators.required]]
                });
                for (let vehicle of this.company.make) {
                    this.makesFilter.push({
                      value: vehicle,
                      label: vehicle,
                      job: ''
                    });
                }
                this.formCompany.get('rut').disable();
                this.formCompany.get('billingType').disable();
                this.formCompany.get('name').disable();
                this.formCompany.get('direction').disable();
                this.formCompany.get('region').disable();
                this.formCompany.get('commune').disable();
                this.formCompany.get('phone').disable();
                this.formCompany.get('accountNumber').disable();
                this.formCompany.get('accountType').disable();
                this.formCompany.get('bank').disable();
                this.formCompany.get('make').disable();
                this.getBilling();
            } else {
                this.loading = false;
                this.toster.error("Algo salio mal al buscar usuario");    
            }
        }, error => {
            console.log(error);
            this.loading = false;
            this.toster.error("Algo salio mal al buscar usuario");
        }
    ));
  }
  private getBilling() {
    this.billingTypes.push({title: 'Factura', slug: 'factura', check: true});
    this.billingTypes.push({title: 'Boleta', slug: 'boleta', check: false});
    this.loading = false;
  }
  public save() {
    this.company.status = (this.formCompany.controls.status && this.formCompany.controls.status.value) ? this.formCompany.controls.status.value.value : this.company.status;
    this.update();
  }
  private update() {
    this.subscription.add(this.srv.updateByRut(this.companyId, this.company).subscribe(
        response => {
            console.log(response);
            this.toster.success("El estado del negocio fue actualizado con éxito");
        }, error => {
            console.log(error);
            this.toster.error("Algo salio mal al guardar cambios de negocio");
        }
    ))
  }
  private searchStatus(id: number, statusFilter: { value: number, label: string, job: string }[]): { value: number, label: string, job: string } | null {
    for (let status of statusFilter) {
        if (status.value === id) {
          return status;
        }
    }
    return null;
  }
  /**
   * metodo para convertir cadena de caraceres en formato rut (puntos y guion)
   * @param rut rut de los talleres del usuario
   * @returns retorna el string con formato rut, si no es valido retornará un mensaje
   */
  formatRut(rut: string) {
    if (rut != '') 
        if (rut?.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }

  goBack() {
    this.router.navigate(['/admin/users/company']);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}

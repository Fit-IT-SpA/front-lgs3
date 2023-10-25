import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Companies } from 'src/app/shared/model/companies.model';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { validate, clean, format } from 'rut.js';
import { numberValidator, mobileValidator } from "../../../../shared/validators/form-validators";
import { Subscription } from 'rxjs';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Session } from 'src/app/shared/model/session';

@Component({
  selector: 'app-companies-edit',
  templateUrl: './companies-edit.component.html',
  styleUrls: ['./companies-edit.component.scss']
})
export class CompaniesEditComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private company: Companies;
  public loading: boolean = true;
  public disabledCommuneFilter: boolean = false;
  public profile: Session =  JSON.parse(localStorage.getItem('profile'));
  public companiesForm: FormGroup;
  private companyId: string;
  public billingTypes: {title: string, slug: string, check: boolean}[] = [];
  public regionFilter: { value: string, label: string, job: string }[] = [];
  public communeFilter: { value: string, label: string, job: string }[] = [];
  public makesFilter: { value: string, label: string, job: string }[] = [];
  public allMakesFilter: { value: string, label: string, job: string }[] = [];
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

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private srv: CompaniesService,
    public toster: ToastrService) { }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        if (params['id']) {
          this.companyId = params['id'];
          this.findCompany(params['id']);
        }
      }));
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
          return perm === ConstantService.PERM_MIS_TALLERES_LECTURA|| perm === ConstantService.PERM_MIS_COMERCIOS_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private findCompany(id: string) {
    this.subscription.add(this.srv.findById(id).subscribe(
      response => {
        this.company = response;
        console.log(this.company);
        this.companiesForm = this.fb.group({
          rut: [format(response.rut), [Validators.required]],
          billingType: [(response.billingType) ? response.billingType : '', (this.profile.role.slug === 'taller') ? [Validators.required] : []],
          name: [response.name, [Validators.required,Validators.maxLength(18)]],
          direction: [response.direction, [Validators.required,Validators.maxLength(140)]],
          region: [{ value: response.region, label: response.region, job: "" }, [Validators.required]],
          commune: [{ value: response.commune, label: response.commune, job: "" }, [Validators.required]],
          phone: [response.phone, [Validators.required,Validators.minLength(9),Validators.maxLength(9),mobileValidator,numberValidator]],
          accountNumber: [response.accountNumber, [Validators.required, numberValidator]],
          accountType: [{ value: response.accountType, label: response.accountType, job: "" }, [Validators.required]],
          bank: [{ value: response.bank, label: response.bank, job: "" }, [Validators.required]],
          make: [this.makesFilter, (this.profile.role.slug === 'comercio') ? [Validators.required] : []],
        });
        this.companiesForm.get('rut').disable();
        this.findMakesOfCompany();
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  private findMakesOfCompany() {
    //console.log(this.makesFilter);
    if (this.company.type === 'comercio') {
      for (let vehicle of this.company.make) {
        this.makesFilter.push({
          value: vehicle,
          label: vehicle,
          job: ''
        });
      }
      this.getVehicleListMake();
    } else {
      this.getRegion();
    }
  }
  private getVehicleListMake() {
    this.subscription.add(this.srv.findVehicleListMake().subscribe(
      response => {
        for (let vehicle of response) {
          this.allMakesFilter.push({
            value: vehicle.make,
            label: vehicle.make,
            job: ''
          })
        }
        //console.log(this.allMakesFilter); 
        this.getRegion();
      }, (error) => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  private getRegion() {
    if (this.profile.role.slug === 'comercio') {
      this.regionFilter.push({
        value: "XIII Región Metropolitana",
        label: "XIII Región Metropolitana",
        job: ''
      });
      this.companiesForm.controls.region.setValue(this.regionFilter[0]);
      this.communeFilter.push({
        value: "Santiago",
        label: "Santiago",
        job: ''
      })
      this.companiesForm.controls.commune.setValue(this.communeFilter[0]);
      this.loading = false;
    } else {
      this.subscription.add(this.srv.findLocationsRegion().subscribe(
        response => {
          console.log(response);
          for (let location of response) {
            this.regionFilter.push({
              value: location.region,
              label: location.region,
              job: ''
            });
          }
          this.getBilling();
        }, error => {
          console.log(error);
          this.loading = false;
        }
      ));
    }
  }
  private getBilling() {
    this.billingTypes.push({title: 'Factura', slug: 'factura', check: (this.companiesForm.controls.billingType.value === 'factura') ? true : false});
    this.billingTypes.push({title: 'Boleta', slug: 'boleta', check: (this.companiesForm.controls.billingType.value === 'boleta') ? true : false});
    console.log(this.billingTypes);
    this.loading = false;
  }
  public clickBilling(slug: string) {
    this.companiesForm.controls.billingType.setValue(slug);
    if (slug === 'boleta') {
      this.companiesForm.controls.name.setValue(this.profile.name);
    } else {
      this.companiesForm.controls.name.setValue("");
    }
  }
  private getCommune() {
    this.subscription.add(this.srv.findLocationsCommuneByRegion(this.companiesForm.controls.region.value.value).subscribe(
      response => {
        for (let location of response) {
          this.communeFilter.push({
            value: location.commune,
            label: location.commune,
            job: ''
          });
        }
        console.log(this.communeFilter);
        this.loading = false;
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  public async onChangeRegionFilter() {
    this.disabledCommuneFilter = true;
    this.companiesForm.controls.commune.setValue(null);
    this.companiesForm.get('commune').disable();
    this.communeFilter = [];
    try {
      const response: {commune: string}[] = await this.srv.findLocationsCommuneByRegion(this.companiesForm.controls.region.value.value).toPromise();
      if (response && response.length > 0) {
        for (let location of response) {
          this.communeFilter.push({
            value: location.commune,
            label: location.commune,
            job: ''
          });
        }
        this.disabledCommuneFilter = false;
        this.companiesForm.get('commune').enable();
      }
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  }
  public onClearRegionFilter() {
    this.disabledCommuneFilter = false;
    this.companiesForm.controls.commune.setValue(null);
    this.companiesForm.get('commune').disable();
    this.communeFilter = [];
  }
  onFocusRut() {
    this.companiesForm.controls.rut.markAsPristine();
    if (this.companiesForm.controls.rut.value != "") {
      this.companiesForm.controls.rut.setValue(
        clean(this.companiesForm.controls.rut.value)
      );
    }
  }

  onBlurRut() {
    if (this.companiesForm.controls.rut.value != "") {
      if (
        this.companiesForm.controls.rut.value.length > 3 &&
        validate(this.companiesForm.controls.rut.value)
      ) {
        this.companiesForm.controls.rut.setErrors(null);
        this.companiesForm.controls.rut.setValue(
          format(this.companiesForm.controls.rut.value)
        );
      } else {
        this.companiesForm.controls.rut.setErrors({ rut: true });
      }
      this.companiesForm.controls.rut.markAsDirty();
    }
  }
  private updateUser() {
    return {
      rut: clean(this.companiesForm.controls.rut.value),
      billingType: this.companiesForm.controls.billingType.value,
      createBy: this.profile.email,
      type: this.profile.role.slug,
      name: this.companiesForm.controls.name.value,
      status: 1,
      direction: this.companiesForm.controls.direction.value,
      region: (this.companiesForm.controls.region.value) ? this.companiesForm.controls.region.value.value : '',
      commune: (this.companiesForm.controls.commune.value) ? this.companiesForm.controls.commune.value.value : '',
      phone: this.companiesForm.controls.phone.value,
      accountNumber: Number(this.companiesForm.controls.accountNumber.value),
      accountType: (this.companiesForm.controls.accountType.value) ? this.companiesForm.controls.accountType.value.value : '',
      make: (this.companiesForm.controls.make.value) ? (this.companiesForm.controls.make.value).map((object: { value: string; label: string; job: string }) => object.value) : [],
      bank: (this.companiesForm.controls.bank.value) ? this.companiesForm.controls.bank.value.value : ''
    }
  }
  save() {
    this.loading = true;
    console.log(this.companiesForm.controls.bank.value);
    console.log(this.companiesForm.controls.accountType.value);
    this.subscription.add(
      this.srv.updateByRut(this.companyId, this.updateUser()).subscribe(
          (response) => {
            this.loading = false;
            this.toster.success('Se editó correctamente su '+this.profile.role.name+'!');
            this.goBack();
          },
          (error) => {
            console.log(error);
            this.loading = false;
            if (error.error.error.message == 'rut repetido') {
              this.toster.error('El rut ingresado ya se encuentra registrado dentro del sistema, intente con un rut distinto');
              this.loading = false;
            } else {
              this.toster.error('Se ha producido un error al intentar editar el '+this.profile.role.name);
              this.loading = false;
            }
          }
      )
    );
  }
  public goBack() {
    this.router.navigate(['/admin/companies']);
  }
}

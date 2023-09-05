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
  public profile: Session =  JSON.parse(localStorage.getItem('profile'));
  public companiesForm: FormGroup;
  private companyId: string;
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
          name: [response.name, [Validators.required,Validators.maxLength(18)]],
          direction: [response.direction, [Validators.required,Validators.maxLength(140)]],
          phone: [response.phone, [Validators.required,Validators.minLength(9),Validators.maxLength(9),mobileValidator,numberValidator]],
          accountNumber: [response.accountNumber, [Validators.required, numberValidator]],
          accountType: [{ value: response.accountType, label: response.accountType, job: "" }, [Validators.required]],
          bank: [{ value: response.bank, label: response.bank, job: "" }, [Validators.required]],
          make: [this.makesFilter, (this.profile.role.slug === 'comercio') ? [Validators.required] : []],
        });
        this.findMakesOfCompany();
      }, error => {
        console.log(error);
      }
    ));
  }
  private findMakesOfCompany() {
    for (let vehicle of this.company.make) {
      this.makesFilter.push({
        value: vehicle,
        label: vehicle,
        job: ''
      });
    }
    //console.log(this.makesFilter);
    if (this.company.type === 'comercio') {
      this.getVehicleListMake();
    } else {
      this.loading = false;
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
        this.loading = false;
      }, (error) => {
        console.log(error);
      }
    ));
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
      createBy: this.profile.email,
      type: this.profile.role.slug,
      name: this.companiesForm.controls.name.value,
      status: 1,
      direction: this.companiesForm.controls.direction.value,
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
            this.toster.error('Se ha producido un error al intentar editar el '+this.profile.role.name);
          }
      )
    );
  }
  public goBack() {
    this.router.navigate(['/admin/companies']);
  }
}

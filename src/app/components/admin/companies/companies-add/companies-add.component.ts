import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from 'src/app/shared/services/service-type.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { numberValidator, mobileValidator } from "../../../../shared/validators/form-validators";
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companies-add',
  templateUrl: './companies-add.component.html',
  styleUrls: ['./companies-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService],
})
export class CompaniesAddComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public loading: boolean = true;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
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
  private user: User;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private userSrv: UserService,
    private srv: CompaniesService,
    public toster: ToastrService) {
    }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.companiesForm = this.fb.group({
        rut: ['', [Validators.required]],
        name: ['', [Validators.required,Validators.maxLength(18)]],
        direction: ['', [Validators.required,Validators.maxLength(140)]],
        phone: ['', [Validators.required,Validators.minLength(9),Validators.maxLength(9),mobileValidator,numberValidator]],
        accountNumber: ['', [Validators.required,numberValidator]],
        accountType: [null, [Validators.required]],
        bank: [null, [Validators.required]],
        make: [null, (this.profile.role.slug === 'comercio') ? [Validators.required] : []],
      });
      this.getVehicleListMake();
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
  private getVehicleListMake() {
    this.subscription.add(this.srv.findVehicleListMake().subscribe(
      response => {
        for (let vehicle of response) {
          this.makesFilter.push({
            value: vehicle.make,
            label: vehicle.make,
            job: ''
          })
        }
        //console.log(this.makesFilter); 
        this.loading = false;
      }, (error) => {
        console.log(error);
      }
    ));
  }

  add() {
    this.loading = true;
    console.log(this.createCompany());
    this.subscription.add(this.srv.add(this.createCompany()).subscribe(
        (response) => {
          this.loading = false;
          this.toster.success('Se agregó correctamente su '+this.profile.role.name+'!');
          this.companiesForm.controls.rut.setValue('');
          this.companiesForm.controls.name.setValue('');
          this.companiesForm.controls.direction.setValue('');
          this.companiesForm.controls.phone.setValue('');
          this.companiesForm.controls.accountNumber.setValue('');
          this.companiesForm.controls.accountType.setValue('');
          this.companiesForm.controls.bank.setValue('');
          this.goBack();
        },
        (error) => {
          console.log(error);
          if (error.error.error.message == 'rut repetido') {
            this.toster.error('El rut de la empresa ya esta ingresado dentro del sistema');
          } else {
            this.toster.error('Se ha producido un error al intentar agregar el '+this.profile.role.name);
          }
        }
    ));
  }
  createCompany() {
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
  public goBack() {
    this.router.navigate(['/admin/companies']);
  }

}

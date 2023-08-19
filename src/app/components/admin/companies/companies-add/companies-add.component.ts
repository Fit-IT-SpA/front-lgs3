import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from 'src/app/shared/services/service-type.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { CompaniesComponent } from '../companies.component';

@Component({
  selector: 'app-companies-add',
  templateUrl: './companies-add.component.html',
  styleUrls: ['./companies-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService],
})
export class CompaniesAddComponent implements OnInit {
  
  @ViewChild("quickViewCompaniesAdd", { static: false }) QuickViewCompaniesAdd: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public loading: boolean = true;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public makesFilter: { value: string, label: string, job: string }[] = [];
  private user: User;

  constructor(
    private modalService: NgbModal,
    public fatherComponent: CompaniesComponent,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: CompaniesService,
    public toster: ToastrService,) {
     }

  ngOnInit(): void {

  }

  openModal(user: User) {
    this.loading = true;
    this.user = user
    this.makesFilter = [];
    this.companiesForm = this.fb.group({
      rut: ['', [Validators.required]],
      name: ['', [Validators.required]],
      direction: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      bank: ['', [Validators.required]],
      make: [null, (this.profile.role.slug === 'comercio') ? [Validators.required] : []],
    });
    this.getVehicleListMake();
    //console.log(this.user);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewCompaniesAdd, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
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
        console.log(this.makesFilter); 
        this.loading = false;
      }, (error) => {
        console.log(error);
      }
    ));
  }

  add() {
    console.log(this.createCompany());
    this.subscription.add(this.srv.add(this.createCompany()).subscribe(
        (response) => {
          this.toster.success('Se agregó correctamente su '+this.profile.role.name+'!');
          this.companiesForm.controls.rut.setValue('');
          this.companiesForm.controls.name.setValue('');
          this.companiesForm.controls.direction.setValue('');
          this.companiesForm.controls.phone.setValue('');
          this.companiesForm.controls.accountNumber.setValue('');
          this.companiesForm.controls.accountType.setValue('');
          this.companiesForm.controls.bank.setValue('');
          this.modalService.dismissAll();
          this.fatherComponent.ngOnInit();
        },
        (error) => {
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
      accountType: this.companiesForm.controls.accountType.value,
      make: (this.companiesForm.controls.make.value) ? (this.companiesForm.controls.make.value).map((object: { value: string; label: string; job: string }) => object.value) : [],
      bank: this.companiesForm.controls.bank.value
    }
  }
  onBlurRut() {
    if (this.companiesForm.controls.rut.value != '') {
      if (this.companiesForm.controls.rut.value.length > 3 && validate(this.companiesForm.controls.rut.value)) {
        this.companiesForm.controls.rut.setErrors(null);
        this.companiesForm.controls.rut.setValue(format(this.companiesForm.controls.rut.value));
        
      } else {
        this.companiesForm.controls.rut.setErrors({'incorrect': true});
      }
      this.companiesForm.controls.rut.markAsDirty();
    }
  }
  onFocusRut(){
    this.companiesForm.controls.rut.markAsPristine();
    if (this.companiesForm.controls.rut.value != ''){
      this.companiesForm.controls.rut.setValue(clean(this.companiesForm.controls.rut.value));
    }
  }

  private getDismissReason(reason: any): string {
    this.companiesForm.controls.rut.setValue('');
    this.companiesForm.controls.name.setValue('');
    this.companiesForm.controls.direction.setValue('');
    this.companiesForm.controls.phone.setValue('');
    this.companiesForm.controls.accountNumber.setValue('');
    this.companiesForm.controls.accountType.setValue('');
    this.companiesForm.controls.bank.setValue('');
    this.modalService.dismissAll();
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}

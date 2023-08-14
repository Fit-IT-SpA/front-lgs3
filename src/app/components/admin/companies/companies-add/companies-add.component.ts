import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from 'src/app/shared/services/service-type.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CompaniesService } from 'src/app/shared/services/companies.service';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';

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
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private user: User;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: CompaniesService,
    public toster: ToastrService,) {
        this.companiesForm = this.fb.group({
            rut: ['', [Validators.required]],
            name: ['', [Validators.required]],
            direction: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            accountNumber: ['', [Validators.required]],
            accountType: ['', [Validators.required]],
            bank: ['', [Validators.required]]
        }); 
     }

  ngOnInit(): void {

  }

  openModal(user: User) {
    this.user = user
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

  add() {
    this.user.companies.push(
      {
        rut: clean(this.companiesForm.controls.rut.value),
        name: this.companiesForm.controls.name.value,
        direction: this.companiesForm.controls.direction.value,
        phone: this.companiesForm.controls.phone.value,
        accountNumber: this.companiesForm.controls.accountNumber.value,
        accountType: this.companiesForm.controls.accountType.value,
        bank: this.companiesForm.controls.bank.value
      }
    );
    this.subscription.add(
      this.srv.add(this.user).subscribe(
          (response) => {
            this.toster.success('Se agregó correctamente su '+this.perfil.role.name+'!');
            this.companiesForm.controls.rut.setValue('');
            this.companiesForm.controls.name.setValue('');
            this.companiesForm.controls.direction.setValue('');
            this.companiesForm.controls.phone.setValue('');
            this.companiesForm.controls.accountNumber.setValue('');
            this.companiesForm.controls.accountType.setValue('');
            this.companiesForm.controls.bank.setValue('');
            this.modalService.dismissAll();
          },
          (error) => {
            if (error.error.error.message == 'rut repetido') {
              this.toster.error('El rut de la empresa ya esta ingresado dentro del sistema');
            } else {
              this.toster.error('Se ha producido un error al intentar agregar el '+this.perfil.role.name);
            }
            this.user.companies.splice(this.user.companies.length-1, 1);
          }
      ));
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
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}

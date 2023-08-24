import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Companies } from 'src/app/shared/model/companies.model';
import { User } from 'src/app/shared/model/user';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { validate, clean, format } from 'rut.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-companies-edit',
  templateUrl: './companies-edit.component.html',
  styleUrls: ['./companies-edit.component.scss']
})
export class CompaniesEditComponent implements OnInit {
  
  @ViewChild("quickViewCompaniesEdit", { static: false }) QuickViewCompaniesEdit: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  private user: User;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  public companiesForm: FormGroup;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private srv: CompaniesService,
    public toster: ToastrService) { }

  ngOnInit(): void {
  }

  openModal(user: User, rut: string) {
    this.user = user;
    this.searchCompany(rut);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewCompaniesEdit, { 
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
  private searchCompany(rut: string) {
    for(let i=0; i < this.user.companies.length; i++) {
      if (this.user.companies[i].rut == rut){
        this.companiesForm = this.fb.group({
          rut   : this.fb.control({value: format(this.user.companies[i].rut), disabled: true}),
          name   : this.fb.control({value: this.user.companies[i].name, disabled: false}),
          direction   : this.fb.control({value: this.user.companies[i].direction, disabled: false}),
          phone   : this.fb.control({value: this.user.companies[i].phone, disabled: false}),
          accountNumber   : this.fb.control({value: this.user.companies[i].accountNumber, disabled: false}),
          accountType   : this.fb.control({value: this.user.companies[i].accountType, disabled: false}),
          bank   : this.fb.control({value: this.user.companies[i].bank, disabled: false}),
        }); 
        break;
      }
    }
    
  }
  private updateUser() {
    let user: User = this.user;
    for(let i=0; i < user.companies.length; i++) {
      if (clean(this.companiesForm.controls.rut.value) == user.companies[i].rut) {
        user.companies[i].name = this.companiesForm.controls.name.value;
        user.companies[i].direction = this.companiesForm.controls.direction.value;
        user.companies[i].phone = this.companiesForm.controls.phone.value;
        user.companies[i].accountNumber = this.companiesForm.controls.accountNumber.value;
        user.companies[i].accountType = this.companiesForm.controls.accountType.value;
        user.companies[i].bank = this.companiesForm.controls.bank.value;
        break;
      }
    }
    return user;
  }
  save() {
    this.subscription.add(
      this.srv.updateByRut(this.updateUser(), clean(this.companiesForm.controls.rut.value)).subscribe(
          (response) => {
            this.toster.success('Se editó correctamente su '+this.perfil.role.name+'!');
            this.modalService.dismissAll();
          },
          (error) => {
            this.toster.error('Se ha producido un error al intentar editar el '+this.perfil.role.name);
          }
      )
    );
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

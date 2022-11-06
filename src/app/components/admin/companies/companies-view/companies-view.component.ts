import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/shared/model/user';
import { CompaniesService } from 'src/app/shared/services/companies.service';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';

@Component({
  selector: 'app-companies-view',
  templateUrl: './companies-view.component.html',
  styleUrls: ['./companies-view.component.scss']
})
export class CompaniesViewComponent implements OnInit {
  
  @ViewChild("quickViewCompaniesView", { static: false }) QuickViewCompaniesView: TemplateRef<any>;
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
      this.modalService.open(this.QuickViewCompaniesView, { 
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
          name   : this.fb.control({value: this.user.companies[i].name, disabled: true}),
          direction   : this.fb.control({value: this.user.companies[i].direction, disabled: true}),
          phone   : this.fb.control({value: this.user.companies[i].phone, disabled: true}),
          accountNumber   : this.fb.control({value: this.user.companies[i].accountNumber, disabled: true}),
          accountType   : this.fb.control({value: this.user.companies[i].accountType, disabled: true}),
          bank   : this.fb.control({value: this.user.companies[i].bank, disabled: true}),
        }); 
        break;
      }
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

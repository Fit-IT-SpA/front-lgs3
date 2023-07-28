import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../../../shared/services/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { validate, clean, format } from 'rut.js';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Order } from 'src/app/shared/model/order.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { Product } from 'src/app/shared/model/product.model';
import { companyDB } from 'src/app/shared/data/tables/company';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');
import { SalesHandlerComponent } from './sales-handler/sales-handler.component';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService]
})
export class SalesComponent implements OnInit {
    
  ejecutarOnInitPadre() {
    this.ngOnInit();
  }
    
  formattedHTML: SafeHtml;
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public ordertable: any[];
  public user: User;
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = false;
  public col: string = '3';
  public companiesName = this.perfil.role.slug == 'taller' ? 'Talleres' : this.perfil.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  public loading: boolean = true;
  //public orders: Order[];
  public products: Product[];
  public offers : Offer[];
  public offersFormat : any[];
  
  public company = [];
  
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  columns = [
    { prop: 'name' },
    { name: 'Gender' },
    { name: 'Company' }
  ];

  @ViewChild("quickViewSalesHandler") QuickViewSalesHandler: SalesHandlerComponent;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private userSrv: UserService,
    private srv: OrderService,
    private srvOffer: OfferService,
    private sanitizer: DomSanitizer,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
        this.company = companyDB.data;
     }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.getOffers();       
    }
  }
  private haveAccess() {
    return true;
  }
  
  public getOffers(){

    this.subscription.add(
        this.companiesSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                this.user = response;
                console.log(this.user.companies);
                let companies = [];
                for(let i=0;i<this.user.companies.length;i++){
                    companies.push(this.user.companies[0].rut);
                }
                this.subscription.add(
                    this.srvOffer.getOffersByCompaniesAndEmail(this.user.email,companies).subscribe(
                        (response) => {
                            let tmpOrders = [];
                            this.offers = response;
                            console.log(this.offers.length);
                            for(let i=0;i < this.offers.length;i++){
                                let status = "";
                                if(this.offers[i].status > -1 && this.offers[i].status <= 2){
                                    status = "<span class='font-primary'>Vigente</span>";
                                }else if (this.offers[i].status == 3) {
                                    status = "<span class='font-primary'>Adjudicado</span>";
                                }else if (this.offers[i].status == 4) {
                                    status = "<span class='font-danger'>Pagado</span>";
                                }else if (this.offers[i].status == 5) {
                                    status = '<button class="btn btn-warning btn-xs" type="button" placement="top">Por confirmar</button>';
                                }else if (this.offers[i].status == 6) {
                                    status = '<button class="btn btn-success btn-xs type="button" placement="top">Confirmado</button>';
                                } else {
                                    status = "<span class='font-warning'>Por Definir ("+this.offers[i].status+")</span>";
                                }
                                tmpOrders.push({
                                    estado : this.offers[i].estado,
                                    origen : this.sanitizer.bypassSecurityTrustHtml('<b>'+this.offers[i].origen+'</b>'),
                                    idOrder : this.offers[i].idProduct,
                                    cantidad : this.offers[i].cantidad,
                                    company : this.offers[i].company,
                                    price : this.offers[i].price,
                                    status : this.sanitizer.bypassSecurityTrustHtml(status),
                                    id : this.offers[i].id,
                                    order : this.offers[i].order,
                                    product : this.offers[i].product,
                                    statusClean: this.offers[i].status
                                });
                            }
                            this.offersFormat = tmpOrders;
                            this.loading = false;
                            
                        },(error) => {
                            this.toster.error('Se ha producido un error al intentar buscar las ofertas.');
                            this.loading = false;
                        }
                    ));
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar las ofertas.');
                this.loading = false;
            }
        )
    );
      

  }
  
  public customCellTemplate(row: any) {
    return `<div class="icon-button" (click)="onCellClick(${row.id})">
              <i class="fa fa-edit"></i>
            </div>`;
  }  
  onCellClick(offer) {
      this.QuickViewSalesHandler.openModal(offer,this.user) 
  }
  public canWrite() {
    return true;
  }
  private async remove(id: string) {
  
}
  
}

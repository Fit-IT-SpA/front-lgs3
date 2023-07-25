import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../../../shared/services/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
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

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService]
})
export class SalesComponent implements OnInit {
  
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

  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private userSrv: UserService,
    private srv: OrderService,
    private srvOffer: OfferService,
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
                    this.srvOffer.getOffersByCompanies(companies).subscribe(
                        (response) => {
                            let tmpOrders = [];
                            this.offers = response;
                            console.log(this.offers.length);
                            for(let i=0;i < this.offers.length;i++){
                                let status = "";
                                if(this.offers[i].status > -1 && this.offers[i].status < 2){
                                    status = "<span class='font-primary'>Vigente</span>";
                                }else if (this.offers[i].status == 3) {
                                    status = "<span class='font-success'>Por Definir (3)</span>";
                                }else if (this.offers[i].status == 4) {
                                    status = "<span class='font-danger'>Por Definir (4)</span>";
                                } else {
                                    status = "<span class='font-warning'>Por Definir ("+this.offers[i].status+")</span>";
                                }
                                tmpOrders.push({
                                    estado : this.offers[i].estado,
                                    origen : '<b>'+this.offers[i].origen+'</b>',
                                    idOrder : this.offers[i].idProduct,
                                    cantidad : this.offers[i].cantidad,
                                    company : this.offers[i].company,
                                    price : this.offers[i].price,
                                    status : status,
                                });
                            }
                            this.offersFormat = tmpOrders;
                            this.loading = false;
                        }
                    ));
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar las ofertas.');
            }
        )
    );
      

  }
  
  public canWrite() {
    return true;
  }
  private async remove(id: string) {
  
}
  
}

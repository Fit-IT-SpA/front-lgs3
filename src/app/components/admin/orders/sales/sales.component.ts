import { Component, OnInit, HostListener } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
//import { validate, clean, format } from 'rut.js';
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
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { UtilService } from 'src/app/shared/services/util.service';

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
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public companies: Companies[] = [];
  public listView: boolean = false;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  public loading: boolean = true;
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  //public orders: Order[];
  public offers : Offer[];
  public offersFormat : any[];
  public filterForm: FormGroup;
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  public periods: string[] = [];
  public parameters: {date: string, status: string} = {
    date: "",
    status: ""
  }
  
  public company = [];
  
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  columns = [
    { prop: 'name' },
    { name: 'Gender' },
    { name: 'Company' }
  ];

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private srv: OfferService,
    private sanitizer: DomSanitizer,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
      this.screenType = utilSrv.getScreenSize();
      if (window.innerWidth < 575) {
        this.listView = true;
        this.filterButton = "Filtrar";
        this.filterHidden = true;
      } else {
        this.filterButton = "Ocultar";
        this.filterHidden = false;
        this.listView = false;
      }
     }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    //console.log('Resolución actual: ' + window.innerWidth + ' x ' + window.innerHeight);
    if (window.innerWidth < 575) {
      this.filterButton = "Filtrar";
      this.listView = true;
      this.filterHidden = true;
    } else {
      this.filterButton = "Ocultar";
      this.filterHidden = false;
      this.listView = false;
    }
  }
  ngOnInit(): void {
    if (this.haveAccess()) {
      this.filterForm = this.formBuilder.group({
        status: "",
        date: ""
      });
      this.parameters.date = (new Date()).toISOString().
      replace(/T/, ' ').      // replace T with a space
      replace(/\..+/, '')     // delete the dot and everything after
      this.getPeriods();     
    }
  }
  private haveAccess() {
    return true;
  }
  private getCount() {
    this.subscription.add(this.srv.getCountSalesByEmail(this.profile.email, this.parameters).subscribe(
      (response) => {
        console.log(response);
        this.totalElements = response.count;
        this.getOffers();
      }, (error) => {
        this.toster.error('Se ha producido un error al intentar buscar las ofertas.');
        this.loading = false;
      }
    ));
    this.getOffers();
  }
  private getOffers(){
    this.subscription.add(
      this.srv.getSalesByEmail(this.profile.email, this.parameters, this.currentPage).subscribe(
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
                      status = '<button class="btn btn-pill btn-primary btn-xs" type="button" placement="top">Pagado</button>';
                  }else if (this.offers[i].status == 6 || this.offers[i].status == 7) {
                      status = '<button class="btn btn-pill btn-info btn-xs type="button" placement="top">En proceso de entrega</button>';
                  } else if (this.offers[i].status == 8) {
                    status = '<button class="btn btn-pill btn-success btn-xs type="button" placement="top">Entregado</button>';
                  } else {
                      status = "<span class='font-warning'>Por Definir ("+this.offers[i].status+")</span>";
                  }
                  tmpOrders.push({
                      estado : this.offers[i].estado,
                      origen : this.sanitizer.bypassSecurityTrustHtml('<b>'+this.offers[i].origen+'</b>'),
                      idOrder : this.offers[i].idProduct,
                      qtyOfferAccepted : this.offers[i].qtyOfferAccepted,
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
  }
  public onCellClick(id: string) {
    this.router.navigate(['/admin/orders/sales/'+id]);
  }
  private getPeriods() {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const actualDate = new Date();
    const actualMonth = months[actualDate.getMonth()];
    const actualYear = actualDate.getFullYear();
    
    actualDate.setMonth(actualDate.getMonth() - 1);
    const previousMonth = months[actualDate.getMonth()];
    const previousYear = actualDate.getFullYear();
    this.periods.push(actualMonth + " " + actualYear);
    this.periods.push(previousMonth + " " + previousYear);
    this.filterForm.controls.date.setValue(this.periods[0]);
    this.parameters.date = this.periods[0];
    this.getCount();
  }
  public onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getCount();
  }
  public changeFilter() {
    this.loading = true;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.date = this.filterForm.controls.date.value;
    console.log(this.parameters);
    this.getCount();
  }
  public showFilter() {
    this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
    this.filterHidden = (this.filterHidden) ? false : true;
  }
  public canWrite() {
    return true;
  }
  private async remove(id: string) {
  
}
  
}

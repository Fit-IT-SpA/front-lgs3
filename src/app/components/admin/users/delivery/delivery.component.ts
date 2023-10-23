import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { Product } from 'src/app/shared/model/product.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { ProductsService } from '../../orders/products/products.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Order } from 'src/app/shared/model/order.model';
import { DeliveryService } from './delivery.service';
import { User } from 'src/app/shared/model/user';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
import { Companies } from 'src/app/shared/model/companies.model';
import { validate, clean, format } from 'rut.js';
import { UtilService } from 'src/app/shared/services/util.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-delivery',
    templateUrl: './delivery.component.html',
    styleUrls: ['./delivery.component.scss'],
    providers: [DeliveryService, ProductsService, OfferService],
})

export class DeliveryComponent implements OnInit {
    private subscription: Subscription = new Subscription();
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    public products: Product[] = [];
    public orderOffer: OfferWithData[] = [];
    public filterForm: FormGroup;
    public periods: string[] = [];
    public parameters: {date: string, status: string} = {
      date: "",
      status: ""
    }
    public pageSize: number = ConstantService.paginationDesktop;
    public currentPage: number = 0;
    public totalElements: number;
    public screenType: string = "";
    public filterHidden: boolean = false;
    public filterButton: string = "Filtrar";
    public listView: boolean = false;

    constructor(
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private router: Router,
        private utilSrv: UtilService,
        private srv: DeliveryService,
        public toster: ToastrService) {
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
        } else {
          this.router.navigate(['/admin/unauthorized']);
        }
    }
    private haveAccess() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_GESTION_VENTAS_ADMIN_LECTURA;
        });
        return access.length > 0;
        } else {
        return false;
        }
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
    private getCount() {
      this.subscription.add(this.srv.countOrdersDelivery(this.parameters).subscribe(
        response => {
            console.log(response);
            this.totalElements = response.count;
            this.getOrders();
        }, error => {
            console.log(error);
            this.loading = false;
        }
      ));
    }
    private getOrders(): void {
        this.subscription.add(this.srv.findOrdersDelivery(this.parameters, this.currentPage).subscribe(
            response => {
                console.log(response);
                this.orderOffer = response;
                this.loading = false;
            }, error => {
                console.log(error);
                this.loading = false;
            }
        ));
    }
    public contactCompany(company: Companies, total: number) {
        let title: string = (company.type === 'taller') ? 'Pago hecho por taller' : (company.type === 'comercio') ? 'Información de comercio' : '';
        let subTitle: string = (company.type === 'taller') ? 'Revisar si el pago fue efectuado en su cuenta' 
        : (company.type === 'comercio') ? 'Depositar a este contacto' : '';
        Swal.fire({
            type: 'info',
            title: title,
            html: 
            '<div class="mb-3">'+subTitle+'</div>'+
            '<div class="row">'+
            '<div class="col">'+
              '<form class="theme-form mega-form">'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Nombre: '+company.name+'">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Banco: '+company.bank+'">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="RUT: '+format(company.rut)+'">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Cta Cte: '+company.phone+'">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Email: '+company.createBy+'">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Total pago: $'+total.toLocaleString('es-CL')+'">'+
                '</div>'+
              '</form>'+
            '</div>'+
          '</div>',
            showConfirmButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
            }
        });
    }
    public paymentReceipt(user: User, companyRut: string, receipt: string) {
      let title: string = (user.role === 'taller') ? 'Comprobante de pago' : (user.role === 'comercio') ? 'Información de comercio' : '';
      let subTitle: string = (user.role === 'taller') ? 'Revisar si el pago fue efectuado en su cuenta' 
      : (user.role === 'comercio') ? 'Depositar a este contacto' : '';
      Swal.fire({
          type: 'info',
          title: title,
          html: 
          '<div class="mb-3">'+subTitle+'</div>'+
          '<div class="row">'+
          '<div class="col">'+
            '<img src="'+receipt+'" class="row mb-3" style="max-width: 100%;height: auto;">'+
          '</div>'+
        '</div>',
          showConfirmButton: true,
          buttonsStyling: false,
          customClass: {
              confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
          }
      });
  }
  public onCellClick(id: string) {
    console.log(id);
    this.router.navigate(['/admin/users/delivery/view/'+id]);
  }
  public showFilter() {
    this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
    this.filterHidden = (this.filterHidden) ? false : true;
  }
  public changeFilter() {
    this.loading = true;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.date = this.filterForm.controls.date.value;
    console.log(this.parameters);
    this.getCount();
  }
  public onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getCount();
  }

}
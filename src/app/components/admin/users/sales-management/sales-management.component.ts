import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { SalesManagementService } from './sales-management.service';
import { User } from 'src/app/shared/model/user';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
import { Companies } from 'src/app/shared/model/companies.model';
import { validate, clean, format } from 'rut.js';
import { SalesManagementViewComponent } from './sales-management-view/sales-management-view.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-sales-management',
    templateUrl: './sales-management.component.html',
    styleUrls: ['./sales-management.component.scss'],
    providers: [SalesManagementService, ProductsService, OfferService],
})

export class SalesManagementComponent implements OnInit {
    @ViewChild("quickViewSalesManagementView") QuickViewSalesManagementView: SalesManagementViewComponent;
    private subscription: Subscription = new Subscription();
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    public products: Product[] = [];
    public orderOffer: OfferWithData[] = [];

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router,
        private srv: SalesManagementService,
        private srvProduct: ProductsService,
        private srvOffer: OfferService,
        public toster: ToastrService) {}
    ngOnInit(): void {
        if (this.haveAccess()) {
            this.getOrders();
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
    private getOrders(): void {
        this.subscription.add(this.srv.findOrders().subscribe(
            response => {
                console.log(response);
                this.orderOffer = response;
                this.loading = false;
            }, error => {
                console.log(error);
            }
        ));
    }
    public refusePayment() {

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

}
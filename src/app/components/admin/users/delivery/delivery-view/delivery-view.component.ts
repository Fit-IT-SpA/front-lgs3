import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { Product } from 'src/app/shared/model/product.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { ProductsService } from '../../../orders/products/products.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Order } from 'src/app/shared/model/order.model';
import { DeliveryService } from '../delivery.service';
import { User } from 'src/app/shared/model/user';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
import { Companies } from 'src/app/shared/model/companies.model';
import { validate, clean, format } from 'rut.js';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-delivery',
    templateUrl: './delivery-view.component.html',
    styleUrls: ['./delivery-view.component.scss'],
    providers: [DeliveryService, ProductsService, OfferService],
})

export class DeliveryViewComponent implements OnInit {
    private subscription: Subscription = new Subscription();
    private offerId: string;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    public data: OfferWithData;

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router,
        private srv: DeliveryService,
        private activatedRoute: ActivatedRoute,
        private srvProduct: ProductsService,
        private srvOffer: OfferService,
        public toster: ToastrService) {}
    ngOnInit(): void {
        if (this.haveAccess()) {
            this.subscription.add(this.activatedRoute.params.subscribe(params => {
                this.offerId = params['id'];
                this.getOffer();
            }));
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
    private getOffer() {
        this.subscription.add(this.srv.findById(this.offerId).subscribe(
            response => {
                console.log(response);
                this.data = response;
                this.loading = false;
            }, error => {
                console.log(error);
                this.loading = false;
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
    public paymentReceipt(receipt: string) {
      Swal.fire({
          type: 'info',
          html: 
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
    private save() {
      this.subscription.add(this.srv.deliveryWithdrawal(this.offerId).subscribe(
        response => {
          console.log(response);
          this.goBack();
        }, error => {
          console.log(error);
        }
      ));
    }
    public confirmWithdrawal() {
      Swal.fire({
        title: 'Estás seguro que deseas confirmar la entrega del producto?',
        text: "Estás confirmando que el producto llego correctamente al taller",
        type: 'warning',
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: 'Si, confirmar!',
        cancelButtonText: 'No, cancelar!',
        reverseButtons: true,
        customClass: {
          confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
          cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
        }
      }).then((result) => {
        if (result.value) {
          this.save();
          Swal.fire(
            'Producto entregado',
            'Esperar confirmación por parte del taller',
            'success'
          );
        }
      })
    }
    public goBack() {
      console.log("goBack");
      this.router.navigate(['/admin/users/delivery']);
      //console.log(this.form);
    }
  
}
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { CartService } from './cart.service';
import { Product } from 'src/app/shared/model/product.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { ProductsService } from '../orders/products/products.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Order } from 'src/app/shared/model/order.model';
declare var require;
const Swal = require('sweetalert2');

export interface OrderOffer {
  order: Order,
  productWithOffers: {
    product: Product, 
    offers: Offer[],
  },
}

@Component({
    selector: 'app-cart-auctions',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
    providers: [CartService, ProductsService, OfferService],
})

export class CartComponent implements OnInit {
    private subscription: Subscription = new Subscription();
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    public products: Product[] = [];
    public orderOffer: OrderOffer[] = [];

    constructor(
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router,
        public srv: CartService,
        private srvProduct: ProductsService,
        private srvOffer: OfferService,
        public toster: ToastrService) {}
    ngOnInit(): void {
        if (this.haveAccess()) {
            this.getProductsInCart();
        } else {
        this.router.navigate(['/admin/unauthorized']);
        }
    }
    private getProductsInCart() {
        this.subscription.add(this.srv.findByEmail(this.profile.email).subscribe(
            response => {
                this.orderOffer = response;
                console.log(this.orderOffer);
                this.loading = false;
                //this.getOrderOfferModel();
            }, error => {
                console.log(error);
                this.loading = false;
            }
        ));
    }
    private haveAccess() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_CAJA_LECTURA;
        });
        return access.length > 0;
        } else {
        return false;
        }
    }
    public totalProduct(offers: Offer[]) {
        var total: number = 0;
        for (let offer of offers) {
            if (offer.status == 3) {
                total+= (offer.price + offer.price * offer.commission) * offer.cantidad;
            }
        }
        return total;
    }
    public totalOrder(productsWithOffers: {product: Product, offers: Offer[]}[]) {
      var total: number = 0;
      for (let product of productsWithOffers) {
        for (let offer of product.offers) {
          total+= (offer.price + offer.price * offer.commission) * offer.cantidad;
        }
      }
      return total;
    }
    public contactTransferInfo(productsWithOffers: {product: Product, offers: Offer[]}[]) {
        const total: number = this.totalOrder(productsWithOffers);
        Swal.fire({
            type: 'info',
            title: 'Formas de Pago',
            html: 
            '<div class="mb-3">Por ahora sólo pagos por transferencia (pronto más medios de pago)</div>'+
            '<div class="row">'+
            '<div class="col">'+
              '<form class="theme-form mega-form">'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Nombre: Planeta Tuerca SpA">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Banco: Banco Talca">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="RUT: 77123456-7">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Cta Cte: 987654321">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Email: pagopedido@planetatuerca.cl">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Total a pagar: $'+total.toLocaleString('es-CL')+'">'+
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
    public confirmPayment(id: string) {
      Swal.fire({
        title: 'Estas seguro que deseas confirmar el pago?',
        text: 'id del pedido: '+id,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, quiero hacerlo!',
        cancelButtonText: 'No, cancelar!',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
          cancelButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
        }
      }).then(async (result) => {
        if (result.value) {
          let confirm: boolean = await this.savePayment(id);
          if (confirm) {
              this.loading = true;
              Swal.fire({
                  title: 'Pago confirmado',
                  text: 'Tu compra será procesada.',
                  type: 'success',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
                  }
              });
              this.getProductsInCart();
          } else {
              Swal.fire({
                  title: 'Ups.. algo salio mal!',
                  text: 'Tu compra no se pudo confirmar.',
                  type: 'error',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
                  }
              });
          }
          
        }
      });
    }
    private async savePayment(id: string): Promise<boolean> {
      try {
        const response = await this.srv.confirmedPayment(id).toPromise();
        console.log(response);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    public ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
      }
}
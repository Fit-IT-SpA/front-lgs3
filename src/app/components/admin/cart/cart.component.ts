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
import { CartConfirmPaymentComponent } from './cart-confirm-payment/cart-confirm-payment.component';
declare var require;
const Swal = require('sweetalert2');

export interface OrderOffer {
  order: Order,
  productWithOffers: {
    product: Product, 
    offers: Offer[],
  }[],
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
    private intervalsId: number[] = [];
    @ViewChild("quickViewCartConfirmPayment") QuickViewCartConfirmPayment: CartConfirmPaymentComponent;

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
    private async getProductsInCart() {
      /*const response: OrderOffer[] = await this.srv.findByEmail(this.profile.email).toPromise();
      this.orderOffer = response;
      console.log(this.orderOffer);
      this.getTimers();*/
        this.subscription.add(this.srv.findByEmail(this.profile.email).subscribe(
            response => {
                this.orderOffer = response;
                console.log(this.orderOffer);
                this.getTimers();
                //this.getOrderOfferModel();
            }, error => {
                console.log(error);
                this.loading = false;
            }
        ));
    }
    private getTimers() {
      for (let data of this.orderOffer) {
        for (let product of data.productWithOffers) {
          for (let offer of product.offers) {
            offer.count = Number(new Date(offer.timerPaymentWorkshop).getTime() - new Date().getTime())
            offer.countMinutes = Math.floor(offer.count / (1000 * 60));
            offer.countSeconds = Math.floor((offer.count % (1000 * 60)) / 1000);
            offer.count = offer.count / 1000;
            if (offer.count > 0) {
              let intervalId = setInterval(() => {
                offer.count--;
                if (offer.count > 0) {
                  if (offer.countSeconds <= 0) {
                    offer.countSeconds = 59;
                    offer.countMinutes--;
                  } else {
                    offer.countSeconds--;
                  }
                } else {
                  // Detiene el intervalo cuando alcanza 0 minutos y 0 segundos
                  this.loading = true;
                  this.ngOnInit();
                  for (let intervalId of this.intervalsId) {
                    clearInterval(intervalId);
                  }
                  
                }
              }, 1000);
              this.intervalsId.push(intervalId);
            }
          }
        }
      }
      this.loading = false;
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
                total+= (offer.price + offer.price * offer.commission) * offer.qtyOfferAccepted;
            }
        }
        return total;
    }
    public totalOrder(productsWithOffers: {product: Product, offers: Offer[]}[]) {
      var total: number = 0;
      for (let product of productsWithOffers) {
        for (let offer of product.offers) {
          total+= (offer.price + offer.price * offer.commission) * offer.qtyOfferAccepted;
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
    public ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
        for (let intervalId of this.intervalsId) {
          clearInterval(intervalId);
        }
    }
}
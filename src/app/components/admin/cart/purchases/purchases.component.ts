import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { CartService } from '../cart.service';
import { Product } from 'src/app/shared/model/product.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { ProductsService } from '../../orders/products/products.service';
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
    selector: 'app-purchases',
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.scss'],
    providers: [CartService, ProductsService, OfferService],
})

export class PurchasesComponent implements OnInit {
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
            this.getPurchases();
        } else {
        this.router.navigate(['/admin/unauthorized']);
        }
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
    private getPurchases() {
        this.subscription.add(this.srv.findPurchases(this.profile.email).subscribe(
            response => {
                console.log(response)
                this.orderOffer = response;
                this.loading = false;
            }, error => {
                console.log(error);
            }
        ));
    }
}

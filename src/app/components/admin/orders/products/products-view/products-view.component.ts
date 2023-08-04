import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { UserService } from '../../../../../shared/services/user.service';
import { CompaniesService } from '../../../../../shared/services/companies.service';
import { User } from '../../../../../shared/model/user';
import { Order } from '../../../../../shared/model/order.model';
import { Offer } from '../../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { ProductsService } from '../products.service';
import { Product } from 'src/app/shared/model/product.model';
import { ProductAdd } from 'src/app/shared/model/product-add.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { OfferService } from 'src/app/shared/services/offer.service';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, ProductsService, OfferService],
})
export class ProductsViewComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private orderId: string;
  private productAdd: ProductAdd;
  private product: Product;
  private order: Order;
  private offers: Offer[] = [];
  public form: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public counterView: number = 1;
  public countQtyOffers: number = 0;
  public confirmOffers: Offer[] = [];
  public totalConfirm: number = 0;
  public filePath: string;
  public imgFile: any;
  public loading: boolean = true;
  public brandFilter: { value: string, label: string, job: string }[] = [
    { value: "CHEVROLET", label: "CHEVROLET", job: "" },
    { value: "HYUNDAI", label: "HYUNDAI", job: "" },
    { value: "KIA MOTORS", label: "KIA MOTORS", job: "" }
  ];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private srvOrder: OrderService,
    private srvOffer: OfferService,
    public toster: ToastrService,
    public srv: ProductsService) {
      this.form = this.fb.group({
        description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
        qty: ['', Validators.required],
        //year: ['', Validators.required],
        //engine: ['', Validators.required],
      });
     }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        this.orderId = params['id'];
        let product: string = params['product'];
        this.getProduct(product);
      }));
    } else {
      this.router.navigate(['/admin/unauthorized']);
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_MIS_PEDIDOS_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }
  private getOrder(id: string) {
    this.subscription.add(this.srvOrder.findById(id).subscribe(
      response => {
          this.order = response;
          console.log(this.order);
          this.getOffers();

      }, error => {
          console.log(error);
          this.loading = false;
      }
    ));
  }
  private getOffers() {
    this.subscription.add(this.srvOffer.findByIdProductAndStatus(this.product.id, 2).subscribe(
      response => {
        this.offers = response;
        console.log(this.offers);
        this.loading = false;
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  private getProduct(id: string) {
    this.subscription.add(this.srv.findById(id).subscribe(
      response => {
        console.log(response);
        this.form = this.fb.group({
          description: this.fb.control({ value: response.title, disabled: true }),
          qty: this.fb.control({ value: response.originalQty, disabled: true }),
        });
        this.product = response;
        this.counterView = response.originalQty;
        this.counter = response.qty;
        this.getOrder(this.orderId);
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  public increment() {
    this.counter += 1;
    this.form.controls.qty.setValue(this.counter);
    //console.log(this.productsAddFormGroup.controls);
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.form.controls.qty.setValue(this.counter);
    }
    //console.log(this.productsAddFormGroup.controls);
  }
  public checkOffer(offer: Offer, event: any) {
    //console.log(event.currentTarget.checked);
    //console.log(offer);
    if (event.currentTarget.checked) {
      this.confirmOffers.push(offer);
      this.countQtyOffers = this.countQtyOffers + offer.cantidad;
      this.totalConfirm = this.totalConfirm + (offer.price + offer.price / 10) * offer.cantidad;
    } else {
      // eliminar elemento del array
      var deleteOffer: Offer = this.confirmOffers.find((off) => off.idOffer === offer.idOffer);
      this.confirmOffers.splice(this.confirmOffers.indexOf(deleteOffer), 1);

      this.countQtyOffers =  this.countQtyOffers - offer.cantidad;
      this.totalConfirm = this.totalConfirm - (offer.price + offer.price / 10) * offer.cantidad;
    }
    //console.log(this.confirmOffers);
  }
  public add() {
    this.loading = true;
    let offersId: string = '';
    for (let i = 0 ; i < this.confirmOffers.length ; i++) {
      if (i == this.confirmOffers.length - 1) 
        offersId = offersId + this.confirmOffers[i].idOffer
      else
        offersId = offersId + this.confirmOffers[i].idOffer +','
    }
    this.save(offersId);
  }
  private save(offersId: string) {
    this.subscription.add(this.srvOffer.updateAllIds(offersId).subscribe(
      response => {
        console.log(response);
        this.toster.success("Se confirmarón "+this.countQtyOffers+" producto(s), para pagar debe pasar por caja.");
        this.router.navigate(['/admin/cart']);
        this.loading = false;
      }, error => {
        console.log(error);
        this.toster.error("Se produjo un error al intentar agregar los productos al carro");
        this.loading = false;
      }
    ));
    /*this.subscription.add(this.srv.updateById(this.product.id, this.product).subscribe(
      response => {
        console.log(response);
        
      }, error => {
        console.log(error);
        
      }
    ));*/
  }
  public goBack() {
    this.router.navigate(['/admin/orders/'+this.orderId+'/products']);
    //console.log(this.form);
  }

}
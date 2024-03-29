import { Component, OnInit, TemplateRef, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { UserService } from '../../../../../shared/services/user.service';
import { CompaniesService } from '../../../companies/companies.service';
import { User } from '../../../../../shared/model/user';
import { Order } from '../../../../../shared/model/order.model';
import { Offer } from '../../../../../shared/model/offer.model';
import { Subscription, interval } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
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
  @ViewChildren('inputCheck') inputChecks: QueryList<ElementRef<HTMLInputElement>>;

  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private orderId: string;
  private product: Product;
  private order: Order;
  private offers: Offer[] = [];
  private intervalsId: number[] = [];
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
  public loadingOffers: boolean = false;
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
          this.loadingOffers = false;
      }
    ));
  }
  private getOffers() {
    this.subscription.add(this.srvOffer.findByIdProductAndStatus(this.product.id, 2).subscribe(
      response => {
        this.offers = response;
        console.log(this.offers);
        this.getTimers();
      }, error => {
        console.log(error);
        this.loading = false;
        this.loadingOffers = false;
      }
    ));
  }
  private getTimers() {
    for (let offer of this.offers) {
      offer.count = Number(new Date(offer.timerVigency).getTime() - new Date().getTime())
      offer.countMinutes = Math.floor(offer.count / (1000 * 60));
      offer.countSeconds = Math.floor((offer.count % (1000 * 60)) / 1000);
      offer.count = offer.count / 1000;
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
          this.loadingOffers = true;
          this.getOffers();
          for (let intervalId of this.intervalsId) {
            clearInterval(intervalId);
          }
        }
      }, 1000);
      this.intervalsId.push(intervalId);
      /*interval(1000)
         .pipe(
             take(offer.count),
         )
         .subscribe(() => {
                offer.count--;
                if (offer.countSeconds <= 0) {
                  offer.countSeconds = 59;
                  offer.countMinutes--;
                } else {
                  offer.countSeconds--;
                }
             },
             () => {
             },
             () => {
                this.loading = true;
                this.getOffers();
             }
         );*/
    }
    this.loading = false;
    this.loadingOffers = false;
  }
  private offerExpired(id: string) {
    console.log(id);
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
  public increment(offer: Offer, index: number) {
    const arrayInputChecks = this.inputChecks.toArray();
    if (offer.qtyOfferAccepted < offer.qty) {
      if (arrayInputChecks[index].nativeElement.checked) {
        this.countQtyOffers = this.countQtyOffers - offer.qtyOfferAccepted;
        this.totalConfirm = this.totalConfirm - (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
      }
      offer.qtyOfferAccepted++;
      if (arrayInputChecks[index].nativeElement.checked) {
        this.countQtyOffers = this.countQtyOffers + offer.qtyOfferAccepted;
        this.totalConfirm = this.totalConfirm + (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
      }
    }
    //console.log(this.productsAddFormGroup.controls);
  }

  public decrement(offer: Offer, index: number) {
    const arrayInputChecks = this.inputChecks.toArray();
    if (offer.qtyOfferAccepted > 1) {
      if (arrayInputChecks[index].nativeElement.checked) {
        this.countQtyOffers = this.countQtyOffers - offer.qtyOfferAccepted;
        this.totalConfirm = this.totalConfirm - (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
      }
      offer.qtyOfferAccepted--;
      if (arrayInputChecks[index].nativeElement.checked) {
        this.countQtyOffers = this.countQtyOffers + offer.qtyOfferAccepted;
        this.totalConfirm = this.totalConfirm + (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
      }
    }
    //console.log(this.productsAddFormGroup.controls);
  }
  public checkOffer(offer: Offer, event: any) {
    //console.log(event.currentTarget.checked);
    console.log(offer);
    if (event.currentTarget.checked) {
      this.confirmOffers.push(offer);
      this.countQtyOffers = this.countQtyOffers + offer.qtyOfferAccepted;
      this.totalConfirm = this.totalConfirm + (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
    } else {
      // eliminar elemento del array
      var deleteOffer: Offer = this.confirmOffers.find((off) => off.idOffer === offer.idOffer);
      this.confirmOffers.splice(this.confirmOffers.indexOf(deleteOffer), 1);

      this.countQtyOffers =  this.countQtyOffers - offer.qtyOfferAccepted;
      this.totalConfirm = this.totalConfirm - (offer.price + offer.price / 10) * offer.qtyOfferAccepted;
    }
    //console.log(this.confirmOffers);
  }
  public add() {
    this.loading = true;
    let offersId: string = '';
    let offersQty: string = '';
    for (let i = 0 ; i < this.confirmOffers.length ; i++) {
      if (i == this.confirmOffers.length - 1)  {
        offersId = offersId + this.confirmOffers[i].idOffer;
        offersQty = offersQty + String(this.confirmOffers[i].qtyOfferAccepted);
      } else {
        offersId = offersId + this.confirmOffers[i].idOffer +',';
        offersQty = offersQty + String(this.confirmOffers[i].qtyOfferAccepted)+',';
      }
    }
    //console.log(offersId);
    //console.log(offersQty);
    this.save(offersId, offersQty);
  }
  private save(offersId: string, offersQty: string) {
    this.subscription.add(this.srvOffer.updateAllIds(offersId, offersQty).subscribe(
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

  public ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    for (let intervalId of this.intervalsId) {
      clearInterval(intervalId);
    }
  }

}
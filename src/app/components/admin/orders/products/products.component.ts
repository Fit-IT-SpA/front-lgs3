import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { User } from '../../../../shared/model/user';
import { Order } from '../../../../shared/model/order.model';
import { Offer } from '../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { ProductsService } from './products.service';
import { Product } from 'src/app/shared/model/product.model';
import { ProductAdd } from 'src/app/shared/model/product-add.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { OfferService } from 'src/app/shared/services/offer.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [UserService, CompaniesService, OrderService, ProductsService, OfferService],
})
export class ProductsComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private productAdd: ProductAdd;
  private products: Product[];
  public order: Order;
  private offers: Offer[] = [];
  public companies: Companies[];
  public counter: number = 1;
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
    public srv: ProductsService) {}

  ngOnInit(): void {
    //this.findOffers();
    if (this.haveAccess()) {
        this.subscription.add(this.activatedRoute.params.subscribe(params => {
            let id: string = params['id'];
            this.getOrder(id);
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
            this.getProducts();
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ));
  }
  private getProducts() {
    this.subscription.add(this.srv.findByOrder(this.order.id).subscribe(
      response => {
        console.log(response);
        this.products = response;
        this.getOffers();
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ));
  }
  private getOffers() {
    this.subscription.add(this.srvOffer.findByIdOrderAndStatus(this.order.id, 2).subscribe(
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
  public add() {
    this.router.navigate(['/admin/orders/'+this.order.id+'/products/add']);
    
  }
  public removeWithConfirmation(id: string) {
    Swal.fire({
      title: 'Estas seguro que deseas eliminar tu repuesto?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!',
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        let confirm = await this.removeProduct(id);
        if (confirm === 'success') {
            Swal.fire({
              title: 'Repuesto eliminado',
              text: 'Tu repuesto ha sido eliminado.',
              type: 'success',
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
              }
            });
            this.ngOnInit();
        } else if (confirm === 'product con ofertas') {
          Swal.fire({
            title: 'Repuesto contiene ofertas',
            text: 'No se puede eliminar el repuesto porque tiene ofertas.',
            type: 'error',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
            }
          });
          this.loading = false;
        } else {
          Swal.fire({
              title: 'Ups.. algo salio mal!',
              text: 'Tu repuesto no se pudo eliminar.',
              type: 'error',
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
              }
          });
          this.loading = false;
        }
        
      }
    });
  }
  public cancelOrder() {
    Swal.fire({
      title: 'Estas seguro que deseas cancelar tu pedido?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!',
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then((result) => {
      if (result.value) {
        let confirm = this.removeOrder();
        if (confirm) {
            Swal.fire({
                title: 'Pedido cancelado',
                text: 'Tu pedido se a cancelado.',
                type: 'success',
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
                }
            });
            this.goBack();
        } else {
            Swal.fire({
                title: 'Ups.. algo salio mal!',
                text: 'Tu pedido no se a cancelado.',
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
  public saveOrder() {
    Swal.fire({
      title: 'Estas seguro que deseas publicar tu pedido?',
      text: 'Tus productos serán visibles para todos los comercios y comenzarás a recibir ofertas. Atento!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!',
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        let confirm = this.save();
        if (confirm) {
            Swal.fire({
                title: 'Pedido publicado',
                text: 'Tu pedido se ha publicado con exito.',
                type: 'success',
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
                }
            });
            this.goBack();
        } else {
            Swal.fire({
                title: 'Ups.. algo salio mal!',
                text: 'Tu pedido no se pudo publicar.',
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
  private async removeOrder() {
    this.subscription.add(this.srvOrder.remove(this.order.id).subscribe(
      response => {
        return true;
      }, error => {
        console.log(error);
        return false;
      }
    ));
    return false;
  }
  private async removeProduct(id: string) {
    try {
      const response = await this.srv.remove(id).toPromise();
      console.log(response);
      return 'success';
    } catch (error) {
      if (error.error.error.message === 'product con ofertas') {
        return error.error.error.message;
      } else {
        return 'error';
      }
    }
  }
  public goBack() {
    this.router.navigate(['/admin/orders']);
  }
  private async save() {
    this.order.status = 1;
    this.subscription.add(this.srvOrder.updateById(this.order, this.order.id).subscribe(
      response => {
        return true
      }, error => {
        return false;
      }
    ));
    return false;
  }
  public findQtyOffer(id: string) : number {
    const offersOfProduct = this.offers.filter((offer) => offer.idProduct === id);
    return (offersOfProduct && offersOfProduct.length > 0) ? offersOfProduct.length : 0;
  }
  public view(id: string) {
    this.router.navigate(['/admin/orders/'+this.order.id+'/products/view/'+id]);
  }
  public edit(id: string) {
    this.router.navigate(['/admin/orders/'+this.order.id+'/products/edit/'+id]);
  }
  public ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
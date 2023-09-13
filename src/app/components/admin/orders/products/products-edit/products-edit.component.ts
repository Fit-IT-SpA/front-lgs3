import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { UserService } from '../../../../../shared/services/user.service';
import { CompaniesService } from '../../../companies/companies.service';
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

@Component({
  selector: 'app-products-edit',
  templateUrl: './products-edit.component.html',
  styleUrls: ['./products-edit.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, ProductsService],
})
export class ProductsEditComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  private productAdd: ProductAdd;
  private product: Product;
  private order: Order;
  private offers: Offer[] = [];
  private orderId: string;
  private productId: string;
  public productForm: FormGroup;
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
    public toster: ToastrService,
    public srv: ProductsService) {
      
     }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        this.orderId = params['id'];
        this.productId = params['product'];
        this.getOrder();
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
  private getOrder() {
    this.subscription.add(this.srvOrder.findById(this.orderId).subscribe(
      response => {
          this.order = response;
          this.getProduct()

      }, error => {
          console.log(error);
          this.loading = false;
      }
    ));
  }
  private getProduct() {
    this.subscription.add(this.srv.findById(this.productId).subscribe(
        response => {
            console.log(response);
            this.product = response;
            this.productForm = this.fb.group({
                description: [this.product.title, [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
                qty: [this.product.originalQty, Validators.required],
            });
            this.counter = this.product.originalQty;
            this.loading = false;
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ));
  }
  public increment() {
    this.counter += 1;
    this.productForm.controls.qty.setValue(this.counter);
    //console.log(this.productForm.controls);
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.productForm.controls.qty.setValue(this.counter);
    }
    //console.log(this.productForm.controls);
  }
  public save() {
    this.loading = true;
    this.subscription.add(this.srv.updateById(this.productId, this.createProduct()).subscribe(
        response => {
            this.loading = false;
            console.log(response);
            this.toster.success('Se actualiza con exito la información de su repuesto.');
            this.goBack();

        }, error => {
            console.log(error);
            if (error.error.error.message === 'product con ofertas') {
                this.toster.error('No se pudo actualizar su repuesto debido a que contiene ofertas.');
            } else {
                this.toster.error('No se pudo actualizar su repuesto.');
            }
            this.loading = false;
            
        }
    ))
  }

  private createProduct() {
    return {
        idOrder: this.order.id,
        //year: '',
        //engine: '',
        title: (this.productForm.controls.description.value) ? this.productForm.controls.description.value : '',
        createBy: this.product.createBy,
        company: this.product.company,
        status: this.product.status,
        qty: (this.productForm.controls.qty.value) ? this.productForm.controls.qty.value : 1,
        originalQty: (this.productForm.controls.qty.value) ? this.productForm.controls.qty.value : 1,
    }
  }
  goBack() {
    this.router.navigate(['/admin/orders/'+this.order.id+'/products']);
    //console.log(this.productForm);
  }

}
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

@Component({
  selector: 'app-products-add',
  templateUrl: './products-add.component.html',
  styleUrls: ['./products-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, ProductsService],
})
export class ProductsAddComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private productAdd: ProductAdd;
  private product: Product;
  private order: Order;
  private offers: Offer[] = [];
  public productsAddFormGroup: FormGroup;
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
      this.productsAddFormGroup = this.fb.group({
        brand: [null, [Validators.required]],
        model: ['', [Validators.minLength(3), Validators.maxLength(40)]],
        chassis: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
        description: ['', [Validators.minLength(3), Validators.maxLength(40)]],
        qty: ['', Validators.required],
        //year: ['', Validators.required],
        //engine: ['', Validators.required],
      });
     }

  ngOnInit(): void {
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
          this.productsAddFormGroup.controls.qty.setValue(this.counter);
          this.loading = false;

      }, error => {
          console.log(error);
      }
    ));
  }
  public increment() {
    this.counter += 1;
    this.productsAddFormGroup.controls.qty.setValue(this.counter);
    //console.log(this.productsAddFormGroup.controls);
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.productsAddFormGroup.controls.qty.setValue(this.counter);
    }
    //console.log(this.productsAddFormGroup.controls);
  }
  public add() {
    this.loading = true;
    this.subscription.add(this.srv.add(this.createProduct()).subscribe(
        response => {
            console.log(response);
            this.product = response;
            this.toster.success('Se agregó con exito su repuesto al pedido.');
            this.goBack();

        }, error => {
            console.log(error);
            this.loading = false;
            this.toster.error('No se pudo agregar su repuesto al pedido.');
        }
    ))
  }

  private createProduct() {
    return {
        idOrder: this.order.id,
        brand: (this.productsAddFormGroup.controls.brand.value) ? this.productsAddFormGroup.controls.brand.value.value : '',
        model: (this.productsAddFormGroup.controls.model.value) ? this.productsAddFormGroup.controls.model.value : '',
        description: (this.productsAddFormGroup.controls.description.value) ? this.productsAddFormGroup.controls.description.value : '',
        status: 1,
        offer: [],
        chassis: (this.productsAddFormGroup.controls.chassis.value) ? this.productsAddFormGroup.controls.chassis.value : '',
        qty: (this.productsAddFormGroup.controls.qty.value) ? this.productsAddFormGroup.controls.qty.value : 1,
    }
  }
  goBack() {
    this.router.navigate(['/admin/orders/'+this.order.id+'/products']);
    //console.log(this.productsAddFormGroup);
  }

}
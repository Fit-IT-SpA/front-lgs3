import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { Product } from 'src/app/shared/model/product.model';
import { ProductsFilter } from 'src/app/shared/model/product-filter';
import { UtilService } from 'src/app/shared/services/util.service';
import { Offer } from 'src/app/shared/model/offer.model';
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { OfferService } from 'src/app/shared/services/offer.service';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-offers-edit',
  templateUrl: './offers-edit.component.html',
  styleUrls: ['./offers-edit.component.scss'],
  providers: [ServiceTypeService, UserService, OfferService]
})
export class OffersEditComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public data: {
    offer: Offer,
    product: Product,
    order: Order
  };
  public offersFormGroup: FormGroup;
  public companies: Companies[];
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public maxQty: number;
  public counter: number = 1;
  public priceMask: number = 0;
  private offerId: string;
  private orderId: string;
  private productId: string;
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private activatedRoute: ActivatedRoute,
    private srv: OfferService,
    private companiesSrv: CompaniesService,
    public toster: ToastrService,) {
      this.screenType = utilSrv.getScreenSize();
      if (window.innerWidth < 575) {
        this.listView = true;
        this.filterButton = "Filtrar";
        this.filterHidden = true;
      } else {
        this.filterButton = "Ocultar";
        this.filterHidden = false;
        this.listView = false;
      }
     }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    //console.log('Resolución actual: ' + window.innerWidth + ' x ' + window.innerHeight);
    if (window.innerWidth < 575) {
      this.filterButton = "Filtrar";
      this.listView = true;
      this.filterHidden = true;
    } else {
      this.filterButton = "Ocultar";
      this.filterHidden = false;
      this.listView = false;
    }
  }
  ngOnInit(): void {
    if (this.haveAccess()) {
        this.subscription.add(this.activatedRoute.params.subscribe(params => {
            this.offerId = params['id'];
            this.getCompanies();
        }));
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_MIS_OFERTAS_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private getCompanies() {
    this.subscription.add(
      this.companiesSrv.findByEmail(this.profile.email).subscribe(
          (response) => {
              this.companies = response;
              this.findOffer();
          }, (error) => {
            console.log(error);
          }
      )
    );
  }
  private findOffer() {
    this.subscription.add(this.srv.getOfferById(this.offerId).subscribe(
        response => {
            console.log(response);
            this.data = response;
            this.productId = response.offer.idProduct;
            this.orderId = response.offer.idOrder;
            this.maxQty = response.product.originalQty
            this.counter = response.offer.qty;
            this.offersFormGroup = this.fb.group({
                //photo: ['', Validators.required],
                estado: [response.offer.estado, Validators.required],
                origen: [response.offer.origen, Validators.required],
                make: [response.offer.make, [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z\s]+$/)]],
                price: [response.offer.price, [Validators.required, Validators.min(200)]],
                cantidad: [response.offer.qty, [Validators.required, Validators.min(1), Validators.max(this.maxQty)]],
                despacho: ['retiro_tienda', Validators.required],
                company: [response.offer.company],
                //comentario: ['']
            });
            this.loading = false;
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ))
  }
  clickCompany(rut: string) {
    this.offersFormGroup.controls.company.setValue(rut);
  }
  
  public increment() {
    if (this.counter < this.maxQty) {
      this.counter += 1;
      this.offersFormGroup.controls.cantidad.setValue(this.counter);
      this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
    }
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.offersFormGroup.controls.cantidad.setValue(this.counter);
        this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
    }
  }
  priceAmount(){
    this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
}
  edit() {
    this.loading = true;
    console.log(this.createOffer());
    this.subscription.add(this.srv.updateById(this.createOffer(), this.offerId).subscribe(
        response => {
            this.toster.success('Se editó correctamente su oferta');
            //this.offersFormGroup.controls.photo.setValue('');
            this.offersFormGroup.controls.origen.setValue('');
            this.offersFormGroup.controls.estado.setValue('');
            this.offersFormGroup.controls.price.setValue('');
            this.offersFormGroup.controls.despacho.setValue('');
            //this.offersFormGroup.controls.comentario.setValue('');
            this.offersFormGroup.controls.company.setValue('');
            this.offersFormGroup.controls.cantidad.setValue(0);
            this.loading = false;
            this.goBack()
        },
        error => {
            console.log(error);
            this.toster.error('No se pudo editar su oferta');
            this.loading = false;
        }
    )); 
  }
  createOffer() {
    return {
        idOffer: this.data.offer.idOffer,
        createBy: this.profile.email,
        price: parseInt(this.offersFormGroup.controls.price.value),
        despacho: this.offersFormGroup.controls.despacho.value,
        //comentario: this.offersFormGroup.controls.comentario.value,
        estado: this.offersFormGroup.controls.estado.value,
        origen: this.offersFormGroup.controls.origen.value,
        make: this.offersFormGroup.controls.make.value,
        qty: this.offersFormGroup.controls.cantidad.value,
        qtyOfferAccepted: this.offersFormGroup.controls.cantidad.value,
        commission: this.data.offer.commission,
        company: this.offersFormGroup.controls.company.value,
        status: this.data.offer.status,
        //photo: this.filePath,
        idOrder : this.orderId,
        idProduct : this.productId
    }
  }
  /**
   * metodo para convertir cadena de caraceres en formato rut (puntos y guion)
   * @param rut rut de los talleres del usuario
   * @returns retorna el string con formato rut, si no es valido retornará un mensaje
   */
   formatRut(rut: string) {
    if (rut != '') 
        if (rut?.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }
  showFilter() {
    this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
    this.filterHidden = (this.filterHidden) ? false : true;
  }
  public canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_MIS_OFERTAS_ESCRITURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  public goBack() {
    this.router.navigate(['/admin/offers/view/'+this.offerId]);
    //console.log(this.form);
  }
}

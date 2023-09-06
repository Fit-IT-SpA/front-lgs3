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
import { Product } from '../../../../../shared/model/product.model';
import { OfferService } from 'src/app/shared/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';

@Component({
  selector: 'app-offers-add',
  templateUrl: './offers-add.component.html',
  styleUrls: ['./offers-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class OffersAddComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  private offer: Offer;
  public offersFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public orderWithProductOffers: {
    order: Order,
    product: Product,
    offers: Offer[]
  };
  public imgFile: any;
  public idOrder: string
  public maxQty: number;
  public priceMask: number = 0;
  public idProduct: string
  public loading: boolean = true;
  public product: Product;
  public order: Order;

  constructor(
    private fb: FormBuilder,
    private srv: OrderService,
    private companiesSrv: CompaniesService,
    private srvOffer: OfferService,
    private router: Router,
    public toster: ToastrService,
    private activatedRoute: ActivatedRoute) {
    }
        
  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        if (params['product']) {
          this.idProduct = params['product'];
          this.getCompanies();
        }
      }));
    }
  }
  private getCompanies() {
    this.subscription.add(
      this.companiesSrv.findByEmail(this.profile.email).subscribe(
          (response) => {
              this.companies = response;
              this.getProduct();
          }, (error) => {
            console.log(error);
          }
      )
    );
  }
  private getProduct() {
    this.subscription.add(this.srv.findProductById(this.idProduct).subscribe(
      response => {
        this.product = response;
        this.maxQty = this.product.originalQty
        this.offersFormGroup = this.fb.group({
          //photo: ['', Validators.required],
          estado: ['', Validators.required],
          origen: ['', Validators.required],
          make: ['', [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z\s]+$/)]],
          price: [0, [Validators.required, Validators.min(200)]],
          cantidad: [1, [Validators.required, Validators.min(1), Validators.max(this.maxQty)]],
          despacho: ['retiro_tienda', Validators.required],
          company: [this.companies[0].rut],
          //comentario: ['']
        });
        this.getOrder();
      }, error => {
        console.log(error);
      }
    ));
  }
  private getOrder() {
    this.subscription.add(this.srv.findById(this.product.idOrder).subscribe(
      response => {
        this.order = response;
        console.log(this.order);
        this.loading = false;
      }, error => {
        console.log(error);
      }
    ))
  }
  
  sumaPrecio(){
      this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
  }

  add() {
    this.loading = true;
    this.offer = this.createOffer();
    this.subscription.add(this.srvOffer.add(this.offer).subscribe(
        response => {
          this.toster.success('Se creó correctamente su Oferta!!');
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
            this.toster.error('No se pudo crear su Oferta :(');
        }
    ));
    
  }
  createOffer() {
    return {
        idOffer: (new Date().getTime()).toString(),
        createBy: this.profile.email,
        price: parseInt(this.offersFormGroup.controls.price.value),
        despacho: this.offersFormGroup.controls.despacho.value,
        //comentario: this.offersFormGroup.controls.comentario.value,
        estado: this.offersFormGroup.controls.estado.value,
        make: (this.offersFormGroup.controls.make.value) ? this.offersFormGroup.controls.make.value : '',
        origen: this.offersFormGroup.controls.origen.value,
        qty: this.offersFormGroup.controls.cantidad.value,
        qtyOfferAccepted: this.offersFormGroup.controls.cantidad.value,
        commission: 0.10,
        company: this.offersFormGroup.controls.company.value,
        status: 2,
        //photo: this.filePath,
        idOrder : this.order.id,
        idProduct : this.idProduct

    }
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
  
  /**
   * metodo para convertir cadena de caraceres en formato rut (puntos y guion)
   * @param rut rut de los talleres del usuario
   * @returns retorna el string con formato rut, si no es valido retornará un mensaje
   */
  formatRut(rut: string) {
    if (rut != '') 
        if (rut.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }
 
  checkImageFile() {
    const inputNode: any = document.querySelector('#file');
    const fileTemp = inputNode.files[0];
    var mimeType = fileTemp.type;
    if (mimeType.match(/image\/*/) == null) {
      this.toster.error('Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg', 'X');
      return;
    } else {
      this.imgFile = fileTemp;
      let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var ramdomName = '';
      for (var i = 30; i > 0; --i) ramdomName += possible[Math.floor(Math.random() * possible.length)];
      var fileExtension = this.imgFile.name.slice(this.imgFile.name.lastIndexOf('.') - this.imgFile.name.length);
      var newFileName = ramdomName + fileExtension;
      const formData = new FormData();

      formData.append("file", this.imgFile, newFileName);
      this.subscription.add(this.srv.uploadFile(formData).subscribe(
        response => {
          let archivo = response;
          this.filePath = this.srv.apiUrl + "/files/" + archivo.files[0].originalname;
          this.toster.success('¡Imagen subida correctamente!');
        }, error => {
            this.toster.error('Se ha producido un error al intentar cargar la imagen');
        }
      ));
      //this.offersFormGroup.controls.photo.setValue(this.imgFile.name);
      return;
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
  public goBack() { 
    this.router.navigate(['/admin/orders/offers']);
  }

}

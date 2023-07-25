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
import { Product } from '../../../../../shared/model/product.model';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offers-add',
  templateUrl: './offers-add.component.html',
  styleUrls: ['./offers-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class OffersAddComponent implements OnInit {
  
  @ViewChild("quickViewOffersAdd", { static: false }) QuickViewOffersAdd: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private user: User;
  private offer: Offer;
  public offersFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public thirdFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  private product: Product;
  public imgFile: any;
  public idOrder: string
  public maxQty: number;
  public idProduct: string

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: OrderService,
    private srvOffer: OfferService,
    private router: Router,
    public toster: ToastrService,) {
    }
        
  ngOnInit(): void {
  }
  /**
   * open Dialog CUBA
   * @param user 
   */
  openModal(product: any, user : User) {
    //this.user = user;
   // this.companies = user.companies;
    console.log(product);
    this.product = product;
    this.idOrder = product.idOrder;
    this.idProduct= product.id;
    this.maxQty = product.qty;
    this.companies = user.companies;
    //console.log(this.user);
    //console.log(this.companies);
    this.modalOpen = true;
    
    this.offersFormGroup = this.fb.group({
        photo: ['', Validators.required],
        estado: ['', Validators.required],
        origen: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(200)]],
        cantidad: [1, [Validators.required, Validators.min(1), Validators.max(this.maxQty)]],
        despacho: ['retiro_tienda', Validators.required],
        company: [this.companies[0].rut],
        comentario: ['']
      });
    
      this.modalService.open(this.QuickViewOffersAdd, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  add() {

    this.offer = this.createOffer();
    this.subscription.add(this.srvOffer.add(this.offer).subscribe(
        response => {  
            console.log(this.product.id);
            console.log(this.idProduct);
            this.subscription.add(this.srv.findByIdOrder(this.product.id).subscribe(
            (response) => {
                this.toster.success('Se creo correctamente su Pedido!!');
                this.offersFormGroup.controls.photo.setValue('');
                this.offersFormGroup.controls.origen.setValue('');
                this.offersFormGroup.controls.estado.setValue('');
                this.offersFormGroup.controls.price.setValue('');
                this.offersFormGroup.controls.despacho.setValue('');
                this.offersFormGroup.controls.comentario.setValue('');
                this.offersFormGroup.controls.company.setValue('');
                this.offersFormGroup.controls.cantidad.setValue(0);
                this.counter = 1;
                this.modalService.dismissAll();
                this.product.offer = response.offer;
            },
                (error) => {
                    console.log(error);
                    this.toster.error('Se creó la oferta, pero no se logró obtener información de Pedido :(');
                }
          ))
            
            
            
        },
        error => {
            console.log(error);
            this.toster.error('No se pudo crear su Pedido :(');
        }
    ));
    
  }
  createOffer() {
    return {
        idOffer: (new Date().getTime()).toString(),
        createBy: this.perfil.email,
        price: this.offersFormGroup.controls.price.value,
        despacho: this.offersFormGroup.controls.despacho.value,
        comentario: this.offersFormGroup.controls.comentario.value,
        estado: this.offersFormGroup.controls.estado.value,
        origen: this.offersFormGroup.controls.origen.value,
        cantidad: this.offersFormGroup.controls.cantidad.value,
        company: this.offersFormGroup.controls.company.value,
        status: 1,
        photo: this.filePath,
        idOrder : this.idOrder,
        idProduct : this.idProduct

    }

  }
  
  clickCompany(rut: string) {
    this.offersFormGroup.controls.company.setValue(rut);
  }
  
  public increment() {
    this.counter += 1;
    this.offersFormGroup.controls.cantidad.setValue(this.counter);
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.offersFormGroup.controls.cantidad.setValue(this.counter);
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
  /**
   * metodo que se dispara al hacer click en un botón radio
   * guarda el rut dentro del formulario
   * @param rut rut del taller que hará el pedido
   */
  
  public finish() {
    this.toster.success('Successfully Registered')
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
      this.offersFormGroup.controls.photo.setValue(this.imgFile.name);
      return;
    }

  }

}

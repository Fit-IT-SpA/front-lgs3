import { Component, OnInit, TemplateRef, ViewChild , EventEmitter } from '@angular/core';
import { SalesComponent } from '../sales.component';
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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Product } from '../../../../../shared/model/product.model';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Router } from '@angular/router';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-sales-handler',
  templateUrl: './sales-handler.component.html',
  styleUrls: ['./sales-handler.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class SalesHandlerComponent implements OnInit  {
  @ViewChild("quickViewSalesHandler", { static: false }) QuickViewSalesHandler: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private user: User;
  private offer: Offer;
  private order: Order;
  private product: Product;
  public offersFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public thirdFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public imgFile: any;
  public idOrder: string
  public maxQty: number;
  public priceMask: number = 0;
  public idProduct: string;
  public estado : string;
  public status : string;

  constructor(
    public componentePadre: SalesComponent,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private sanitizer: DomSanitizer,
    private srv: OrderService,
    private srvOffer: OfferService,
    private router: Router,
    public toster: ToastrService,) {
    }
        
  ngOnInit(): void {
  }

  ejecutarOnInitPadre() {
    this.componentePadre.ejecutarOnInitPadre();
  }
  
  /**
   * open Dialog CUBA
   * @param user 
   */
  openModal(obj: any, user : User) {
    this.user = user;
    this.offer = obj;
    this.status = obj.statusClean;
    if(obj.statusClean == 2){ 
        this.estado = "VIGENTE";
    } else if (obj.statusClean == 3) {
        this.estado = "ADJUDICADO";
    }else if (obj.statusClean == 4) {
        this.estado = "PAGADO";
    }else if (obj.statusClean == 5) {
        this.estado = "POR CONFIRMAR";
    }else if (obj.statusClean == 6) {
        this.estado = "CONFIRMADO";
    }

    this.modalOpen = true;

      this.modalService.open(this.QuickViewSalesHandler, { 
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

  confirmarPago(offer){
      const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-pill btn-primary mr-2',
              cancelButton: 'btn btn-pill btn-info ml-2'
            },
            buttonsStyling: false,
          });   
        swalWithBootstrapButtons.fire({
        title: 'Confirmación de Pago',
        text: "Repuesto: "+offer.product.title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Estoy seguro',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) { 
           this.srvOffer.updateStatusById(this.offer.id,6).subscribe(
            (response) => {
                this.modalService.dismissAll();
                Swal.fire(
                    {title:'Pago confirmado',
                    icon: 'success'
                });
               
                this.ejecutarOnInitPadre();
                
            },   
            (error) => {
                Swal.fire(
                {title:'Error al confirmar pago',
                icon: 'error'
                });
            });
        }
      });
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
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}

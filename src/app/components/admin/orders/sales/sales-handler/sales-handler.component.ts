import { Component, OnInit, TemplateRef, ViewChild , EventEmitter } from '@angular/core';
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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Product } from '../../../../../shared/model/product.model';
import { OfferService } from 'src/app/shared/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-sales-handler',
  templateUrl: './sales-handler.component.html',
  styleUrls: ['./sales-handler.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class SalesHandlerComponent implements OnInit  {
  private subscription: Subscription = new Subscription();
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public data: {offer: Offer, order: Order, product: Product};
  private offerId: string;
  public loading: boolean = true;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private srv: OfferService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public toster: ToastrService,) {
    }
        
  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
          this.offerId = params['id'];
          this.getOffer();
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
  private getOffer() {
    this.subscription.add(this.srv.getOfferById(this.offerId).subscribe(
      response => {
          console.log(response);
          this.data = response;
          this.loading = false;
      }, error => {
          console.log(error);
          this.loading = false;
      }
  ))
  }
  /*openModal(obj: any, user : User) {
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
  }*/

  public confirmarPago(){
      const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
              cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
            },
            buttonsStyling: false,
          });   
        swalWithBootstrapButtons.fire({
        title: 'Confirmación de Pago',
        text: "Repuesto: "+this.data.product.title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Estoy seguro',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) { 
          this.loading = true;
          this.srv.updateStatusById(this.data.offer.id,6).subscribe(
            (response) => {
                this.modalService.dismissAll();
                Swal.fire(
                    {title:'Pago confirmado',
                    icon: 'success'
                });
                this.goBack();
            },   
            (error) => {
                Swal.fire(
                {title:'Error al confirmar pago',
                icon: 'error'
                });
                this.loading = false;
            });
        }
      });
  }
  public paymentReceipt(receipt: string) {
    Swal.fire({
        type: 'info',
        html: 
        '<div class="row">'+
        '<div class="col">'+
          '<img src="'+receipt+'" class="row mb-3" style="max-width: 100%;height: auto;">'+
        '</div>'+
      '</div>',
        showConfirmButton: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
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
  public goBack() {
    this.router.navigate(['/admin/orders/sales']);
    //console.log(this.form);
  }
}

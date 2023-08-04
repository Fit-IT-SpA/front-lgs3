import { Component, OnInit, TemplateRef, ViewChild , EventEmitter } from '@angular/core';
import { PurchasesComponent } from '../purchases.component';
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
import { Product } from '../../../../../shared/model/product.model';
import { Router } from '@angular/router';
import { CartService } from '../../cart.service';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-purchases-view',
    templateUrl: './purchases-view.component.html',
    styleUrls: ['./purchases-view.component.scss'],
    providers: [CartService],
})
export class PurchasesViewComponent implements OnInit  {
    @ViewChild("quickViewParchasesView", { static: false }) QuickViewParchasesView: TemplateRef<any>;
    private subscription: Subscription = new Subscription();
    public closeResult: string;
    public modalOpen: boolean = false;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public offerData: OfferWithData;
    constructor(
        public fatherComponent: PurchasesComponent,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private srv: CartService,
        private router: Router,
        public toster: ToastrService,) {
        }
            
    ngOnInit(): void {

    }
    openModal(offer: OfferWithData) {
        this.offerData = offer;
        console.log(this.offerData);
        this.modalOpen = true;
    
          this.modalService.open(this.QuickViewParchasesView, { 
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
    public confirmProductReceived(id: string) {
        Swal.fire({
            title: 'Excelente noticia!',
            text: 'Confirma que ya tienes el producto en tu poder',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, Confirmo',
            cancelButtonText: 'Volver',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
              cancelButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
            }
          }).then(async (result) => {
            if (result.value) {
              let confirm: boolean = await this.saveProductReceived(id);
              if (confirm) {
                  Swal.fire({
                      title: 'Producto recibido',
                      text: 'Gracias por confirmar que su producto llegó a su taller.',
                      type: 'success',
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
                      }
                  });
                  this.modalService.dismissAll();
                  this.fatherComponent.ngOnInit();
                  
              } else {
                  Swal.fire({
                      title: 'Ups.. algo salio mal!',
                      text: 'Tu compra no se pudo confirmar.',
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
    private async saveProductReceived(id: string) {
        try {
            const response = await this.srv.confirmProductReceived(id).toPromise();
            console.log(response);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
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

}
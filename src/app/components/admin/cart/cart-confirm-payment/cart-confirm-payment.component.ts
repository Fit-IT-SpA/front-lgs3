import { Component, OnInit, TemplateRef, ViewChild , EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Offer } from '../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../../../shared/model/product.model';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { CartComponent, OrderOffer } from '../cart.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-cart-confirm-payment',
    templateUrl: './cart-confirm-payment.component.html',
    styleUrls: ['./cart-confirm-payment.component.scss'],
    providers: [CartService],
})
export class CartConfirmPaymentComponent implements OnInit  {
    @ViewChild("quickViewCartConfirmPayment", { static: false }) QuickViewCartConfirmPayment: TemplateRef<any>;
    private subscription: Subscription = new Subscription();
    public closeResult: string;
    public modalOpen: boolean = false;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public offerData: OrderOffer;
    public loadingImg: boolean = false;
    public filePath: string;
    public imgFile: any;
    public url: ArrayBuffer | string;
    public form: FormGroup;
    private photoName: string = '';
    constructor(
        public fatherComponent: CartComponent,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private srv: CartService,
        public toster: ToastrService,) {
        }
            
    ngOnInit(): void {
        this.form = this.fb.group({
            photo: ['', [Validators.required]],
            //engine: ['', Validators.required],
        });
    }
    openModal(offer: OrderOffer) {
        this.offerData = offer;
        console.log(this.offerData);
        this.modalOpen = true;
    
          this.modalService.open(this.QuickViewCartConfirmPayment, { 
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
    public totalOrder(productsWithOffers: {product: Product, offers: Offer[]}[]) {
        var total: number = 0;
        for (let product of productsWithOffers) {
          for (let offer of product.offers) {
            total+= (offer.price + offer.price * offer.commission) * offer.qtyOfferAccepted;
          }
        }
        return total;
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
    fileChangeEvent(event: any) {
        this.loadingImg = true;
        console.log(event.target.files[0]);
        const file = event.target.files[0];
        var mimeType = event.target.files[0].type;
        console.log(mimeType);
        if (mimeType.match(/image\/*/) == null) {
          this.loadingImg = false;
          this.toster.error("Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg");
        } else {
          this.imgFile = file;
          let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          var ramdomName = '';
          for (var i = 30; i > 0; --i) ramdomName += possible[Math.floor(Math.random() * possible.length)];
          var fileExtension = this.imgFile.name.slice(this.imgFile.name.lastIndexOf('.') - this.imgFile.name.length);
          var newFileName = ramdomName + fileExtension;
          const formData = new FormData();
    
          formData.append("file", this.imgFile, newFileName);
          this.subscription.add(this.srv.uploadFile(formData).subscribe(
            response => {
              this.loadingImg = false;
              let archivo = response;
              this.photoName = archivo.files[0].originalname;
              this.filePath =archivo.files[0].originalname;
              this.url = this.filePath;
              this.form.controls.photo.setValue(this.url);
              this.toster.success('¡Imagen subida correctamente!');
            }, error => {
                console.log(error);
                this.toster.error('Se ha producido un error al intentar cargar la imagen');
                this.loadingImg = false;
            }
          ));
        }
    }
    public confirmPayment(id: string) {
        Swal.fire({
            title: 'Estas seguro que deseas confirmar el pago?',
            text: 'id del pedido: '+id,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, quiero hacerlo!',
            cancelButtonText: 'No, cancelar!',
            buttonsStyling: false,
            customClass: {
            confirmButton: 'btn btn-pill btn-primary', // Agrega tu clase CSS personalizada aquí
            cancelButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
            }
        }).then(async (result) => {
            if (result.value) {
                let confirm: boolean = await this.savePayment(id);
                if (confirm) {
                    Swal.fire({
                        title: 'Pago confirmado',
                        text: 'Tu compra será procesada.',
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
    private async savePayment(id: string): Promise<boolean> {
        try {
            const response = await this.srv.confirmedPayment(id, this.form.controls.photo.value).toPromise();
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
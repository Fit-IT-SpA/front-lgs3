import { Component, OnInit, TemplateRef, ViewChild , EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Offer } from '../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../../../shared/model/product.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { OrderOffer } from '../cart.component';
import { CompaniesService } from '../../companies/companies.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-cart-confirm-payment',
    templateUrl: './cart-confirm-payment.component.html',
    styleUrls: ['./cart-confirm-payment.component.scss'],
    providers: [CartService],
})
export class CartConfirmPaymentComponent implements OnInit  {
    private subscription: Subscription = new Subscription();
    public closeResult: string;
    public modalOpen: boolean = false;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loadingImg: boolean = false;
    public filePath: string;
    public imgFile: any;
    public url: ArrayBuffer | string;
    public firstFormGroup: FormGroup;
    public secondFormGroup: FormGroup;
    public loading: boolean = true;
    public data: Offer[] = [];
    public showNewFields: boolean = false;
    public regionFilter: { value: string, label: string, job: string }[] = [];
    public communeFilter: { value: string, label: string, job: string }[] = [];
    public disabledCommuneFilter: boolean = false;
    private photoName: string = '';
    private orderId: string;
    private parameters: {delivery: string, region: string, commune: string, avenue: string, recipientName: string, recipientLastName: string, photo: string};
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private companiesSrv: CompaniesService,
        private srv: CartService,
        public toster: ToastrService,) {
        }
            
    ngOnInit(): void {
        if (this.haveAccess()) {
            this.firstFormGroup = this.fb.group({
                delivery: [null, Validators.required],
                region: [null, Validators.required],
                commune: [null, Validators.required],
                avenue: ['', [Validators.required, Validators.maxLength(140)]],
                recipientName: ['', [Validators.required, Validators.maxLength(30)]],
                recipientLastName: ['', [Validators.required, Validators.maxLength(30)]]
            });
            this.firstFormGroup.get('region').disable();
            this.firstFormGroup.get('commune').disable();
            this.firstFormGroup.get('avenue').disable();
            this.firstFormGroup.get('recipientName').disable();
            this.firstFormGroup.get('recipientLastName').disable();
            this.secondFormGroup = this.fb.group({
                photo: ['', [Validators.required]],
                //engine: ['', Validators.required],
            });
            this.subscription.add(this.activatedRoute.params.subscribe(params => {
                if (params['id']) {
                  this.orderId = params['id'];
                  this.getRegion();
                }
              }));
            
        }
    }
    private haveAccess() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
            let access = permissions.filter((perm: string) => {
              return perm === ConstantService.PERM_CAJA_LECTURA;
            });
            return access.length > 0;
        } else {
            return false;
        }
    }
    private findOrder() {
        this.subscription.add(this.srv.findByOrder(this.orderId).subscribe(
            response => {
                this.data = response;
                this.loading = false;
            }, error => {
                console.log(error);
            }
        ));
    }
    public selectDelivery(option: string) {
        this.firstFormGroup.controls.delivery.setValue(option);
        if (option === "despacho_domicilio") {
          this.showNewFields = true;
          this.firstFormGroup.get('region').enable();
          this.firstFormGroup.get('commune').enable();
          this.firstFormGroup.get('avenue').enable();
          this.firstFormGroup.get('recipientName').enable();
          this.firstFormGroup.get('recipientLastName').enable();
        } else {
          this.showNewFields = false;
          this.firstFormGroup.get('region').disable();
          this.firstFormGroup.get('commune').disable();
          this.firstFormGroup.get('avenue').disable();
          this.firstFormGroup.get('recipientName').disable();
          this.firstFormGroup.get('recipientLastName').disable();
        }
    }
    private getRegion() {
      this.firstFormGroup.get('commune').disable();
      this.subscription.add(this.companiesSrv.findLocationsRegion().subscribe(
        response => {
          for (let location of response) {
            this.regionFilter.push({
              value: location.region,
              label: location.region,
              job: ''
            });
          }
          this.findOrder();
        }, error => {
          console.log(error);
        }
      ));
    }
    public async onChangeRegionFilter() {
      this.disabledCommuneFilter = true;
      this.firstFormGroup.controls.commune.setValue(null);
      this.firstFormGroup.get('commune').disable();
      this.communeFilter = [];
      try {
        const response: {commune: string}[] = await this.companiesSrv.findLocationsCommuneByRegion(this.firstFormGroup.controls.region.value.value).toPromise();
        if (response && response.length > 0) {
          for (let location of response) {
            this.communeFilter.push({
              value: location.commune,
              label: location.commune,
              job: ''
            });
          }
          this.disabledCommuneFilter = false;
          this.firstFormGroup.get('commune').enable();
        }
      } catch (error) {
        console.log(error);
      }
    }
    public onClearRegionFilter() {
      this.disabledCommuneFilter = false;
      this.firstFormGroup.controls.commune.setValue(null);
      this.firstFormGroup.get('commune').disable();
      this.communeFilter = [];
    }
    /*openModal(offer: OrderOffer) {
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
      }*/
    public confirmProductReceived(id: string) {
        Swal.fire({
            title: 'Excelente noticia!',
            text: 'Confirma que ya tienes el producto en tu poder',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, Confirmo',
            cancelButtonText: 'Volver',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
                cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
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
    public totalOrder() {
        var total: number = 0;
        for (let offer of this.data) {
            total+= (offer.price + offer.price * offer.commission) * offer.qtyOfferAccepted;
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
              this.secondFormGroup.controls.photo.setValue(this.url);
              this.toster.success('¡Imagen subida correctamente!');
            }, error => {
                console.log(error);
                this.toster.error('Se ha producido un error al intentar cargar la imagen');
                this.loadingImg = false;
            }
          ));
        }
    }
    public contactTransferInfo() {
        const total: number = this.totalOrder();
        Swal.fire({
            type: 'info',
            title: 'Formas de Pago',
            html: 
            '<div class="mb-3">Por ahora sólo pagos por transferencia (pronto más medios de pago)</div>'+
            '<div class="row">'+
            '<div class="col">'+
              '<form class="theme-form mega-form">'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Razón Social: Planeta Tuerca SpA">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Banco: Santander">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="RUT: 77.835.672-4">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Cta Cte: 92663701">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Email: facturacion@planetatuercas.cl">'+
                '</div>'+
                '<div class="form-group">'+
                  '<input class="form-control" type="text" disabled="true" placeholder="Total a pagar: $'+total.toLocaleString('es-CL')+'">'+
                '</div>'+
              '</form>'+
            '</div>'+
          '</div>',
            showCloseButton: true,
            showConfirmButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
            }
        });
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
                    this.router.navigate(['/admin/purchases']);
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
          if (this.firstFormGroup.controls.delivery.value === "despacho_domicilio") {
            this.parameters = {
              delivery: this.firstFormGroup.controls.delivery.value, 
              region: this.firstFormGroup.controls.region.value.value, 
              commune: this.firstFormGroup.controls.commune.value.value, 
              avenue: this.firstFormGroup.controls.avenue.value, 
              recipientName: this.firstFormGroup.controls.recipientName.value, 
              recipientLastName: this.firstFormGroup.controls.recipientLastName.value,
              photo: this.secondFormGroup.controls.photo.value
            }
          } else {
            this.parameters = {
              delivery: this.firstFormGroup.controls.delivery.value, 
              region: '', 
              commune: '', 
              avenue: '', 
              recipientName: '', 
              recipientLastName: '',
              photo: this.secondFormGroup.controls.photo.value
            }
          }
          const response = await this.srv.confirmedPayment(id, this.parameters).toPromise();
          console.log(response);
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
    }
    public goBack() {
        this.router.navigate(['/admin/cart']);
    }

}
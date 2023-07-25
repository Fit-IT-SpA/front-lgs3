import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { UserService } from '../../../../../shared/services/user.service';
import { CompaniesService } from '../../../../../shared/services/companies.service';
import { User } from '../../../../../shared/model/user';
import { Order } from '../../../../../shared/model/order.model';
import { Product } from '../../../../../shared/model/product.model';
import { Offer } from '../../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { OfferService } from 'src/app/shared/services/offer.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-offers-detail',
  templateUrl: './offers-detail.component.html',
  styleUrls: ['./offers-detail.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class OffersDetailComponent implements OnInit {
  
  @ViewChild("quickViewOffersDetail", { static: false }) QuickViewOffersDetail: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private order: Order;
  private product: Product;
  private offers: Offer[] = [];
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public thirdFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public imgFile: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srvOffer: OfferService,
    private srv: OrderService,
    public toster: ToastrService,) {
        this.firstFormGroup = this.fb.group({
            company: ['', Validators.required],
          });
          this.secondFormGroup = this.fb.group({
            brand: ['', Validators.required],
            model: ['', Validators.required],
            year: ['', Validators.required],
            engine: ['', Validators.required],
          });
          this.thirdFormGroup = this.fb.group({
            productName: ['', Validators.required],
            productBrand: ['', Validators.required],
            productDetails: ['', Validators.required],
            limitPrice: ['', Validators.required],
            qty: [this.counter, Validators.required],
            closingDate: ['', Validators.required],
            closingTime: [{hour: new Date().getHours(), minute: new Date().getMinutes()}, Validators.required],
            photo: ['', Validators.required],
          })
     }

  ngOnInit(): void {
    this.findOffers();
  }
  /**
   * open Dialog CUBA
   * @param user 
   */
  openModal(product: Product) {
    this.product = product;
    //this.offers = product.offer;
     console.log(product);
    //console.log(this.companies);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewOffersDetail, { 
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
  
  removeWithConfirmation(idOffer: string, index) {
        Swal.fire({
          title: '¿Estas seguro que deseas eliminar la oferta '+idOffer+'?',
          text: "No podras revertir esto despues!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, quiero hacerlo!',
          cancelButtonText: 'No, cancelar!'
        }).then((result) => {
          if (result.value) {  
            this.subscription.add(this.srvOffer.remove(idOffer).subscribe(
               (response) => {
                 this.subscription.add(this.srv.findByIdOrder(this.product.id).subscribe(
                    (response) => {
                        Swal.fire(
                            'Eliminado!',
                            'Tu oferta '+idOffer+' se a eliminado.',
                            'success'
                        )
                        this.offers = response.offer;
                        //this.product.offer = response.offer;
                        console.log(this.offers);
                    },
                        (error) => {
                            this.offers.splice(index, 1);
                            document.getElementById("offer_"+index).remove();
                            Swal.fire(
                                'Eliminado!',
                                'Tu oferta '+idOffer+' se a eliminado, pero no logramos actualizar las ofertas en la vista, se recomienda actualizar la página.',
                                'success'
                            )   
                        }
                  ))
               },
               (error) => {
                Swal.fire(
                      'Ups.. algo salio mal!',
                      'Tu oferta '+idOffer+' no se a eliminado.',
                      'error'
                  )
                }
             ))
          }
        })
      }
      
      public async remove(idOffer: string) {
        await this.subscription.add(this.srvOffer.remove(idOffer).subscribe(
          (response) => {
            return response
          },
          (error) => {
            return false;
          }
        ))
        return false;
    }
  
  /**
   * metodo que se dispara al hacer click en un botón radio
   * guarda el rut dentro del formulario
   * @param rut rut del taller que hará el pedido
   */
  clickCompany(rut: string) {
    this.firstFormGroup.controls.company.setValue(rut);
    //console.log(this.firstFormGroup.controls.company.value);
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
  private findOffers() {
  }

}

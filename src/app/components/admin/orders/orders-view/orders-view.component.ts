import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../../../shared/services/companies.service';
import { User } from '../../../../shared/model/user';
import { Order } from '../../../../shared/model/order.model';
import { Offer } from '../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';

@Component({
  selector: 'app-orders-view',
  templateUrl: './orders-view.component.html',
  styleUrls: ['./orders-view.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService],
})
export class OrdersViewComponent implements OnInit {
  
  @ViewChild("quickViewOrdersView", { static: false }) QuickViewOrdersView: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private order: Order;
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
  openModal(order: Order) {
    this.order = order;
    console.log(this.order);
    //console.log(this.companies);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewOrdersView, { 
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

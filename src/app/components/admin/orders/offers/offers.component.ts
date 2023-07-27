import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../../../shared/services/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { OffersAddComponent } from './offers-add/offers-add.component';
import { OffersViewComponent } from './offers-view/offers-view.component';
import { OffersDetailComponent } from './offers-detail/offers-detail.component';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { Product } from 'src/app/shared/model/product.model';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService]
})
export class OffersComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public ordertable: any[];
  public user: User;
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public companiesName = this.perfil.role.slug == 'taller' ? 'Talleres' : this.perfil.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  //public orders: Order[];
  public products: Product[];
  
  // Ventanas Popup
  @ViewChild("quickViewOffersAdd") QuickViewOffersAdd: OffersAddComponent;
  @ViewChild("quickViewOffersView") QuickViewOffersView: OffersViewComponent;
  @ViewChild("quickViewOffersDetail") QuickViewOffersDetail: OffersDetailComponent;
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private userSrv: UserService,
    private srv: OrderService,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
     }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.findUser();
    }
  }
  private haveAccess() {
    return true;
  }
  checkStatusUser() {
    this.subscription.add(
        this.companiesSrv.checkStatusUser(this.perfil.email).subscribe(
            (response) => {
                if (response == 0) {
                    this.router.navigate(['/admin/companies']);
                }
            }
        )
    );
  }
  private findUser() {
    this.subscription.add(
        this.companiesSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                this.user = response;
                this.findOrders();
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesName);
            }
        )
    );
  }
  private findOrders() {
    this.subscription.add(this.srv.findOfferByMail(this.user.email).subscribe(
      response => {
        this.products = response;
        this.loading = false;  
        if(!this.user.companies || this.user.companies.length <= 0){
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'btn btn-pill btn-primary mr-2',
                  cancelButton: 'btn btn-pill btn-info ml-2'
                },
                buttonsStyling: false,
              });   
            swalWithBootstrapButtons.fire({
            title: 'Ups! no has ingresado los datos de tu local',
            text: "Sólo podrás ver pedidos, pero no podrás ofertar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Agregar local',
            cancelButtonText: 'Ver pedidos'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['admin/companies']);
            }
          });
        } 
      }
    ))
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
  toggleListView(val) {
    this.listView = val;
  }
  gridColumn(val) {
    this.col = val;
  }
  public canWrite() {
    return true;
  }
  private async remove(id: string) {
    this.subscription.add(this.srv.remove(id).subscribe(
      response => {
        return response;
      }
    ))
    return false;
}
  removeWithConfirmation(id: string) {
    Swal.fire({
      title: 'Estas seguro que deseas eliminar tu pedido?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!'
    }).then((result) => {
      if (result.value) {
        let confirm = this.remove(id);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                'Tu pedido se a eliminado.',
                'success'
            )
            this.findOrders();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'Tu pedido no se a eliminado.',
                'error'
            )
        }
        
      }
    })
  }

}

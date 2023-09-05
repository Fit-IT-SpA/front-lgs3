import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../shared/services/service-type.service';
import { UserService } from '../../../shared/services/user.service';
import { CompaniesService } from '../companies/companies.service';
import { User } from '../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { OrdersViewComponent } from './orders-view/orders-view.component';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { OrdersEditComponent } from './orders-edit/orders-edit.component';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { Companies } from 'src/app/shared/model/companies.model';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService],
})
export class OrdersComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public companies: Companies[];
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = false;
  public col: string = '3';
  public companiesName = this.perfil.role.slug == 'taller' ? 'Talleres' : this.perfil.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
  public orders: Order[];
  public loading: boolean = true;
  
  // Ventanas Popup
  @ViewChild("quickViewOrdersView") QuickViewOrdersView: OrdersViewComponent;
  @ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

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
      this.getUser();
    } else {
      this.router.navigate(['/admin/unauthorized']);
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_MIS_PEDIDOS_LECTURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
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
  private getUser() {
    this.subscription.add(
        this.companiesSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                this.companies = response;
                if (this.companies && this.companies.length < 1) {
                  this.router.navigate(['/admin/companies']);
                } else {
                  this.findOrders();
                }
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesName);
                this.loading = false;
            }
        )
    );
  }
  private findOrders() {
    this.subscription.add(this.srv.findByEmail(this.perfil.email).subscribe(
      response => {
        this.orders = response;
        console.log(this.orders);
        this.loading = false;
      }, error => {
        console.log(error);
        this.toster.error('Se a producido un error al intentar buscar los pedidos');
        this.loading = false;
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
        if (rut.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }
  toggleListView(val) {
    this.listView = val;
  }
  gridColumn(val) {
    this.col = val;
  }
  canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_MIS_PEDIDOS_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }
  private async remove(id: string) {
    this.subscription.add(this.srv.remove(id).subscribe(
      response => {
        return response;
      }
    ))
    return false;
  }
  orderView(id: string) {
    this.router.navigate(['/admin/orders/'+id+'/products']);
  }
  removeWithConfirmation(id: string) {
    Swal.fire({
      title: 'Estas seguro que deseas cancelar tu pedido?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        let confirm = this.remove(id);
        if (confirm) {
            Swal.fire(
                'Pedido cancelado',
                'Tu pedido se a cancelado.',
                'success'
            )
            this.ngOnInit();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'Tu pedido no se a cancelado.',
                'error'
            )
        }
        
      }
    })
  }
  add() {
    this.router.navigate(['/admin/orders/add']);
  }

}
